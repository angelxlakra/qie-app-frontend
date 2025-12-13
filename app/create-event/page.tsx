"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { isAddress, parseEther, parseEventLogs, type Abi } from "viem";
import EventFactoryABI from "@/abis/EventFactory.json";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { toast } from "sonner";

type TierForm = {
  tierName: string;
  price: string;
  maxSupply: string;
};

const EMPTY_TIER: TierForm = { tierName: "", price: "", maxSupply: "" };

export default function CreateEventPage() {
  const router = useRouter();
  const { isConnected } = useAccount();

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [baseURI, setBaseURI] = useState("");
  const [royaltyBps, setRoyaltyBps] = useState("500");
  const [tiers, setTiers] = useState<TierForm[]>([{ ...EMPTY_TIER }]);
  const [gatekeepers, setGatekeepers] = useState<string[]>([""]);
  const [createdEvent, setCreatedEvent] = useState<`0x${string}` | null>(null);

  const {
    data: hash,
    isPending,
    writeContract,
    error: writeError,
  } = useWriteContract();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  });

  const isSubmitting = isPending || isConfirming;

  const cleanGatekeepers = useMemo(
    () =>
      gatekeepers
        .map((g) => g.trim())
        .filter((g) => g.length > 0) as `0x${string}`[],
    [gatekeepers]
  );

  // Handle transaction toasts
  useEffect(() => {
    if (isPending) toast.loading('Waiting for wallet approval...', { id: 'create-event' });
    if (isConfirming) toast.loading('Creating event on blockchain...', { id: 'create-event' });
    if (writeError) toast.error('Failed to create event', { id: 'create-event', description: writeError.message.split('\n')[0] });
  }, [isPending, isConfirming, writeError]);

  useEffect(() => {
    if (!receipt) return;

    try {
      const logs = parseEventLogs({
        abi: EventFactoryABI as Abi,
        eventName: "EventCreated",
        logs: receipt.logs,
      }) as Array<{ args?: { eventAddress?: `0x${string}` } }>;

      const log = logs[0];
      const eventAddress = log?.args?.eventAddress;
      if (eventAddress) {
        setCreatedEvent(eventAddress);
        toast.success("Event created successfully!", { id: 'create-event' });
        const timer = setTimeout(() => {
          router.push(`/events/${eventAddress}`);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch (err) {
      console.error("Failed to parse EventCreated log", err);
      toast.error("Event created but failed to parse address", { id: 'create-event' });
    }
  }, [receipt, router]);

  const handleTierChange = (
    index: number,
    field: keyof TierForm,
    value: string
  ) => {
    setTiers((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addTier = () => setTiers((prev) => [...prev, { ...EMPTY_TIER }]);

  const removeTier = (index: number) => {
    if (tiers.length === 1) return;
    setTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGatekeeperChange = (index: number, value: string) => {
    setGatekeepers((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const addGatekeeper = () => setGatekeepers((prev) => [...prev, ""]);

  const removeGatekeeper = (index: number) => {
    setGatekeepers((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!isConnected) {
      toast.error("Connect your wallet to create an event.");
      return null;
    }

    if (!name.trim() || !symbol.trim() || !baseURI.trim()) {
      toast.error("Name, symbol, and base URI are required.");
      return null;
    }

    const royalty = Number(royaltyBps);
    if (Number.isNaN(royalty) || royalty < 0 || royalty > 10000) {
      toast.error("Royalty must be between 0 and 10000 basis points.");
      return null;
    }

    const preparedTiers = tiers
      .map((tier, index) => ({
        ...tier,
        tierId: BigInt(index + 1),
        price: tier.price.trim(),
        maxSupply: tier.maxSupply.trim(),
      }))
      .filter((tier) => tier.tierName && tier.price && tier.maxSupply);

    if (preparedTiers.length === 0) {
      toast.error("Add at least one tier with price and supply.");
      return null;
    }

    const tierPayload = [];
    for (const tier of preparedTiers) {
      let priceWei: bigint;
      try {
        priceWei = parseEther(tier.price);
      } catch {
        toast.error("Enter a valid price for each tier (use decimals only).");
        return null;
      }
      const maxSupplyValue = Number(tier.maxSupply);
      if (!Number.isInteger(maxSupplyValue) || maxSupplyValue <= 0) {
        toast.error("Tier supply must be a positive integer.");
        return null;
      }

      tierPayload.push({
        tierId: tier.tierId,
        tierName: tier.tierName,
        price: priceWei,
        maxSupply: BigInt(maxSupplyValue),
      });
    }

    for (const address of cleanGatekeepers) {
      if (!isAddress(address)) {
        toast.error(`Invalid gatekeeper address: ${address}`);
        return null;
      }
    }

    return {
      royaltyBpsValue: BigInt(royalty),
      tierPayload,
      gatekeepers: cleanGatekeepers,
    };
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const validated = validateForm();
    if (!validated) return;

    setCreatedEvent(null);

    writeContract({
      address: CONTRACT_ADDRESSES.eventFactory,
      abi: EventFactoryABI,
      functionName: "createEvent",
      args: [
        {
          name: name.trim(),
          symbol: symbol.trim(),
          baseURI: baseURI.trim(),
          royaltyBps: validated.royaltyBpsValue,
        },
        validated.tierPayload,
        validated.gatekeepers,
      ],
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1 container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto space-y-8">
          <header className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-50">
              Create a New Event
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Deploy a new event contract with ticket tiers and gatekeepers.
            </p>
          </header>

          <div className="grid lg:grid-cols-3 gap-6">
            <section className="lg:col-span-2 card">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                    Event Details
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Event Name
                      </span>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input"
                        placeholder="Summer Music Festival"
                        required
                      />
                    </label>
                    <label className="space-y-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Symbol
                      </span>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        className="input"
                        placeholder="SMF"
                        maxLength={6}
                        required
                      />
                    </label>
                    <label className="md:col-span-2 space-y-1">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        Base URI
                      </span>
                      <input
                        type="url"
                        value={baseURI}
                        onChange={(e) => setBaseURI(e.target.value)}
                        className="input"
                        placeholder="https://api.example.com/metadata/"
                        required
                      />
                    </label>
                    <label className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          Royalty (bps)
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          500 = 5%
                        </span>
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={10000}
                        value={royaltyBps}
                        onChange={(e) => setRoyaltyBps(e.target.value)}
                        className="input"
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      Ticket Tiers
                    </h2>
                    <button
                      type="button"
                      onClick={addTier}
                      className="btn-secondary"
                    >
                      + Add Tier
                    </button>
                  </div>

                  <div className="space-y-4">
                    {tiers.map((tier, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3 bg-gray-50 dark:bg-gray-800"
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                            Tier #{index + 1}
                          </div>
                          {tiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTier(index)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="grid md:grid-cols-3 gap-3">
                          <label className="space-y-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              Tier Name
                            </span>
                            <input
                              type="text"
                              value={tier.tierName}
                              onChange={(e) =>
                                handleTierChange(
                                  index,
                                  "tierName",
                                  e.target.value
                                )
                              }
                              className="input"
                              placeholder="VIP"
                            />
                          </label>
                          <label className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Price (QIE)
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                wei
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.0001"
                              min="0"
                              value={tier.price}
                              onChange={(e) =>
                                handleTierChange(index, "price", e.target.value)
                              }
                              className="input"
                              placeholder="0.05"
                            />
                          </label>
                          <label className="space-y-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              Max Supply
                            </span>
                            <input
                              type="number"
                              min={1}
                              value={tier.maxSupply}
                              onChange={(e) =>
                                handleTierChange(
                                  index,
                                  "maxSupply",
                                  e.target.value
                                )
                              }
                              className="input"
                              placeholder="500"
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                      Gatekeepers
                    </h2>
                    <button
                      type="button"
                      onClick={addGatekeeper}
                      className="btn-secondary"
                    >
                      + Add Address
                    </button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Gatekeepers are addresses allowed to validate tickets
                    (optional).
                  </p>

                  <div className="space-y-3">
                    {gatekeepers.map((gatekeeper, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          value={gatekeeper}
                          onChange={(e) =>
                            handleGatekeeperChange(index, e.target.value)
                          }
                          className="input flex-1"
                          placeholder="0x..."
                        />
                        <button
                          type="button"
                          onClick={() => removeGatekeeper(index)}
                          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                          aria-label="Remove gatekeeper"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Creating event..."
                    : isSuccess
                    ? "Event created"
                    : "Create Event"}
                </button>
              </form>
            </section>

            <aside className="card space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                Creation Checklist
              </h2>
              <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <li>• Connect your wallet on QIE Testnet (chain ID 1983).</li>
                <li>• Add at least one ticket tier with price and supply.</li>
                <li>• Royalty is set in basis points (500 = 5%).</li>
                <li>
                  • Gatekeepers are optional. Leave blank if none are needed.
                </li>
              </ul>

              <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="text-xs uppercase text-gray-500 dark:text-gray-400 mb-1">
                  Status
                </div>
                <div className="space-y-1 text-sm">
                  <div>
                    Transaction:{" "}
                    {hash ? (
                      <span className="font-mono text-blue-700 dark:text-blue-300">
                        {hash.slice(0, 12)}...
                      </span>
                    ) : (
                      "Not started"
                    )}
                  </div>
                  <div>
                    Confirmation:{" "}
                    {isPending
                      ? "Awaiting wallet"
                      : isConfirming
                      ? "Confirming..."
                      : isSuccess
                      ? "Confirmed"
                      : "Idle"}
                  </div>
                  {createdEvent && (
                    <div className="break-all text-green-700 dark:text-green-300">
                      Event Address: {createdEvent}
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
