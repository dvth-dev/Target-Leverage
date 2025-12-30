import { useState, useEffect } from 'react';

interface Entry {
    id: string;
    amount: string; // Invested Amount ($)
    tokens: string; // Token Amount
}

const AveragePrice = () => {
    // Load state from localStorage or default to one empty entry
    const [entries, setEntries] = useState<Entry[]>(() => {
        const saved = localStorage.getItem('dcaEntries');
        return saved ? JSON.parse(saved) : [{ id: crypto.randomUUID(), amount: '', tokens: '' }];
    });

    const [result, setResult] = useState<{
        totalAmount: number;
        totalTokens: number;
        averagePrice: number;
    } | null>(null);

    // Persist state
    useEffect(() => {
        localStorage.setItem('dcaEntries', JSON.stringify(entries));
    }, [entries]);

    // Calculate whenever entries change
    useEffect(() => {
        let totalAmount = 0;
        let totalTokens = 0;
        let hasValidEntry = false;

        entries.forEach(entry => {
            const amount = parseFloat(entry.amount);
            const tokens = parseFloat(entry.tokens);

            if (!isNaN(amount) && !isNaN(tokens)) {
                totalAmount += amount;
                totalTokens += tokens;
                hasValidEntry = true;
            }
        });

        if (hasValidEntry && totalTokens > 0) {
            setResult({
                totalAmount,
                totalTokens,
                averagePrice: totalAmount / totalTokens
            });
        } else {
            setResult(null);
        }
    }, [entries]);

    const addEntry = () => {
        setEntries([...entries, { id: crypto.randomUUID(), amount: '', tokens: '' }]);
    };

    const updateEntry = (id: string, field: 'amount' | 'tokens', value: string) => {
        // Allow ONLY digits, commas, and dots
        const cleanValue = value.replace(/[^0-9.,]/g, '');
        const normalizedValue = cleanValue.replace(/,/g, '.');
        const distinctParts = normalizedValue.split('.');
        const finalValue = distinctParts.shift() + (distinctParts.length ? '.' + distinctParts.join('') : '');

        setEntries(entries.map(entry =>
            entry.id === id ? { ...entry, [field]: finalValue } : entry
        ));
    };

    const removeEntry = (id: string) => {
        if (entries.length > 1) {
            setEntries(entries.filter(entry => entry.id !== id));
        } else {
            // If it's the last entry, just clear it
            setEntries([{ id: crypto.randomUUID(), amount: '', tokens: '' }]);
        }
    };

    const clearEntries = () => {
        if (window.confirm('Clear all entries?')) {
            setEntries([{ id: crypto.randomUUID(), amount: '', tokens: '' }]);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">

                {/* Left Column: Inputs - Reduced to 5 columns */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    <div className="tech-border p-6 relative flex-grow">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-[#00f0ff] text-sm font-bold font-['Press_Start_2P'] uppercase">
                                DCA ENTRIES
                            </h2>
                            <button
                                onClick={clearEntries}
                                className="text-[#ff4d00] text-xs hover:text-[#ff7033] font-['Press_Start_2P'] transition-colors"
                            >
                                CLEAR ALL
                            </button>
                        </div>

                        <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {entries.map((entry, index) => (
                                <div key={entry.id} className="relative group/entry animate-in fade-in slide-in-from-left-4 duration-300">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                        <div className="group">
                                            <label className="block text-[#8b9bb4] text-[10px] font-bold font-['Press_Start_2P'] uppercase mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                                Entry #{index + 1} Invested
                                            </label>
                                            <div className="tech-input-container flex items-center h-12">
                                                <span className="pl-3 text-[#232d4b] font-bold text-sm">$</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={entry.amount}
                                                    onChange={(e) => updateEntry(entry.id, 'amount', e.target.value)}
                                                    className="w-full bg-transparent text-[#eef2f6] p-2 focus:outline-none font-mono text-lg placeholder-[#232d4b] h-full"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="group">
                                            <label className="block text-[#8b9bb4] text-[10px] font-bold font-['Press_Start_2P'] uppercase mb-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                                Entry #{index + 1} Tokens
                                            </label>
                                            <div className="tech-input-container flex items-center relative h-12">
                                                <span className="pl-3 text-[#232d4b] font-bold text-sm">#</span>
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={entry.tokens}
                                                    onChange={(e) => updateEntry(entry.id, 'tokens', e.target.value)}
                                                    className="w-full bg-transparent text-[#eef2f6] p-2 focus:outline-none font-mono text-lg placeholder-[#232d4b] pr-8 h-full"
                                                    placeholder="0.00"
                                                />
                                                {entries.length > 1 && (
                                                    <button
                                                        onClick={() => removeEntry(entry.id)}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#161b33] border border-[#ff4d00] text-[#ff4d00] rounded-full flex items-center justify-center hover:bg-[#ff4d00] hover:text-[#161b33] transition-all z-10 text-xs"
                                                        title="Remove Entry"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addEntry}
                            className="w-full mt-6 py-3 border border-dashed border-[#00f0ff] text-[#00f0ff] font-['Press_Start_2P'] text-xs hover:bg-[#00f0ff]/10 transition-all rounded"
                        >
                            + ADD ENTRY (DCA)
                        </button>
                    </div>
                </div>

                {/* Right Column: Results - Increased to 7 columns */}
                <div className="lg:col-span-7 flex">
                    <div className="tech-border p-8 w-full flex flex-col justify-between items-center relative min-h-[300px] bg-[#0b1026]/50">
                        {/* Decorative Lines */}
                        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#00f0ff] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#ff4d00] opacity-20"></div>

                        {result ? (
                            <div className="text-center w-full z-10 flex flex-col h-full justify-between">
                                <div className="flex-grow flex flex-col justify-center w-full overflow-hidden px-4">
                                    <span className="block text-[#8b9bb4] text-xs uppercase tracking-[0.3em] mb-4">Average Price</span>
                                    {(() => {
                                        if (!result.averagePrice) return (
                                            <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#00f0ff] to-[#0080ff] font-['Press_Start_2P'] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)] whitespace-nowrap px-2">
                                                $0
                                            </div>
                                        );

                                        const truncated = Math.floor(result.averagePrice * 1000000) / 1000000;
                                        const displayPrice = truncated.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 6 });

                                        // Conservative dynamic font sizing
                                        // Press Start 2P is a very wide font, so we need smaller sizes than standard fonts
                                        let fontSizeClass = "text-3xl md:text-4xl lg:text-5xl"; // Base size for short prices (e.g. 0.12, 100)

                                        const len = displayPrice.length;
                                        if (len > 13) {
                                            // very long: 1,234,567.123456 (16 chars)
                                            fontSizeClass = "text-sm md:text-base lg:text-xl";
                                        } else if (len > 10) {
                                            // long: 1234.123456 (11 chars) or 123,456.12 (10 chars)
                                            fontSizeClass = "text-lg md:text-xl lg:text-2xl";
                                        } else if (len > 7) {
                                            // medium: 0.123456 (8 chars)
                                            fontSizeClass = "text-xl md:text-2xl lg:text-3xl";
                                        }

                                        return (
                                            <div className={`${fontSizeClass} font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#00f0ff] to-[#0080ff] font-['Press_Start_2P'] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)] whitespace-nowrap px-2 w-full text-center tracking-tighter`}>
                                                ${displayPrice}
                                            </div>
                                        );
                                    })()}
                                </div>

                                <div className="space-y-4 w-full border-t border-[#232d4b] pt-8 mt-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#8b9bb4] text-xs uppercase">Total Invested</span>
                                        <span className="text-[#eef2f6] text-lg font-mono">${result.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#8b9bb4] text-xs uppercase">Total Tokens</span>
                                        <span className="text-[#ff4d00] text-lg font-mono">{result.totalTokens.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[#232d4b] text-center font-['Press_Start_2P'] text-sm animate-pulse m-auto">
                                WAITING DATA
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AveragePrice;
