import { useState, useEffect } from 'react';

interface TabData {
    balance: string;
    risk: string;
}

const Calculator = () => {
    // Load initial state from localStorage or default
    const [activeTab, setActiveTab] = useState<'price' | 'percent'>(() => {
        return (localStorage.getItem('activeTab') as 'price' | 'percent') || 'price';
    });

    const [tabData, setTabData] = useState<{ price: TabData; percent: TabData }>(() => {
        const saved = localStorage.getItem('tabData');
        return saved ? JSON.parse(saved) : {
            price: { balance: '', risk: '' },
            percent: { balance: '', risk: '' }
        };
    });

    const [entryPrice, setEntryPrice] = useState<string>(() => localStorage.getItem('entryPrice') || '');
    const [stopLossPrice, setStopLossPrice] = useState<string>(() => localStorage.getItem('stopLossPrice') || '');
    const [slPercent, setSlPercent] = useState<string>(() => localStorage.getItem('slPercent') || '');

    const [result, setResult] = useState<{
        leverage: number;
        roundedLeverage: number;
        positionSize: number;
        riskPercent: number;
    } | null>(null);

    // Persist state changes
    useEffect(() => {
        localStorage.setItem('activeTab', activeTab);
    }, [activeTab]);

    useEffect(() => {
        localStorage.setItem('tabData', JSON.stringify(tabData));
    }, [tabData]);

    useEffect(() => {
        localStorage.setItem('entryPrice', entryPrice);
        localStorage.setItem('stopLossPrice', stopLossPrice);
        localStorage.setItem('slPercent', slPercent);
    }, [entryPrice, stopLossPrice, slPercent]);

    // Helper to update tab-specific data
    const updateTabData = (field: keyof TabData, value: string) => {
        setTabData(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }));
    };

    const currentBalance = tabData[activeTab].balance;
    const currentRisk = tabData[activeTab].risk;

    const calculate = () => {
        const bal = parseFloat(currentBalance);
        const risk = parseFloat(currentRisk);

        if (!bal || !risk) return;

        let positionSize = 0;
        let leverage = 0;

        if (activeTab === 'price') {
            const entry = parseFloat(entryPrice);
            const sl = parseFloat(stopLossPrice);

            if (!entry || !sl) return;

            const priceDiff = Math.abs(entry - sl);
            const priceDiffPercent = priceDiff / entry;

            positionSize = risk / priceDiffPercent;
            leverage = positionSize / bal;
        } else {
            const slP = parseFloat(slPercent);
            if (!slP) return;

            positionSize = risk / (slP / 100);
            leverage = positionSize / bal;
        }

        setResult({
            leverage: leverage,
            roundedLeverage: Math.ceil(leverage),
            positionSize: positionSize,
            riskPercent: (risk / bal) * 100
        });
    };

    useEffect(() => {
        calculate();
    }, [currentBalance, currentRisk, entryPrice, stopLossPrice, slPercent, activeTab]);


    const handleInputChange = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const cleanValue = value.replace(/[^0-9.,]/g, '');
        const normalizedValue = cleanValue.replace(/,/g, '.');
        const distinctParts = normalizedValue.split('.');
        const finalValue = distinctParts.shift() + (distinctParts.length ? '.' + distinctParts.join('') : '');
        setter(finalValue);
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-8">

                {/* Left Column: Inputs */}
                <div className="lg:col-span-7 flex flex-col gap-8">

                    {/* Tab Switcher */}
                    <div className="flex p-1 bg-[#0b1026] border border-[#232d4b] rounded-lg relative">
                        <button
                            onClick={() => setActiveTab('price')}
                            className={`flex-1 py-3 text-sm font-['Press_Start_2P'] uppercase transition-all duration-300 relative z-10 ${activeTab === 'price' ? 'text-[#0b1026]' : 'text-[#8b9bb4] hover:text-[#eef2f6]'
                                }`}
                        >
                            Price Action
                        </button>
                        <button
                            onClick={() => setActiveTab('percent')}
                            className={`flex-1 py-3 text-sm font-['Press_Start_2P'] uppercase transition-all duration-300 relative z-10 ${activeTab === 'percent' ? 'text-[#0b1026]' : 'text-[#8b9bb4] hover:text-[#eef2f6]'
                                }`}
                        >
                            Percentage
                        </button>
                        {/* Sliding Background */}
                        <div
                            className={`absolute top-1 bottom-1 rounded bg-[#00f0ff] transition-all duration-300 ease-out shadow-[0_0_15px_rgba(0,240,255,0.5)]`}
                            style={{
                                left: activeTab === 'price' ? '0.25rem' : '50%',
                                width: 'calc(50% - 0.25rem)'
                            }}
                        />
                    </div>

                    {/* Section 1: Capital */}
                    <div className="tech-border p-6 relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="group">
                                <label className="flex items-center gap-2 text-[#00f0ff] text-xs font-bold font-['Press_Start_2P'] uppercase mb-3">
                                    <span className="w-2 h-2 bg-[#00f0ff]"></span>
                                    Balance
                                </label>
                                <div className="tech-input-container flex items-center">
                                    <span className="pl-4 text-[#232d4b] font-bold">$</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={currentBalance}
                                        onChange={handleInputChange((val) => updateTabData('balance', val))}
                                        className="w-full bg-transparent text-[#eef2f6] p-3 focus:outline-none font-mono text-xl placeholder-[#232d4b]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold font-['Press_Start_2P'] uppercase mb-3">
                                    <span className="w-2 h-2 bg-[#ff4d00]"></span>
                                    Risk (1R)
                                </label>
                                <div className="tech-input-container flex items-center">
                                    <span className="pl-4 text-[#232d4b] font-bold">R</span>
                                    <input
                                        type="text"
                                        inputMode="decimal"
                                        value={currentRisk}
                                        onChange={handleInputChange((val) => updateTabData('risk', val))}
                                        className="w-full bg-transparent text-[#eef2f6] p-3 focus:outline-none font-mono text-xl placeholder-[#232d4b]"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Strategy */}
                    <div className="tech-border p-6 relative flex-grow flex flex-col justify-center">
                        {activeTab === 'price' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group">
                                    <label className="flex items-center gap-2 text-[#00f0ff] text-xs font-bold font-['Press_Start_2P'] uppercase mb-3">
                                        <span className="w-2 h-2 bg-[#00f0ff]"></span>
                                        Entry
                                    </label>
                                    <div className="tech-input-container">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={entryPrice}
                                            onChange={handleInputChange(setEntryPrice)}
                                            className="w-full bg-transparent text-[#eef2f6] p-3 focus:outline-none font-mono text-xl placeholder-[#232d4b]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="group">
                                    <label className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold font-['Press_Start_2P'] uppercase mb-3">
                                        <span className="w-2 h-2 bg-[#ff4d00]"></span>
                                        Stop Loss
                                    </label>
                                    <div className="tech-input-container">
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={stopLossPrice}
                                            onChange={handleInputChange(setStopLossPrice)}
                                            className="w-full bg-transparent text-[#eef2f6] p-3 focus:outline-none font-mono text-xl placeholder-[#232d4b]"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="group">
                                    <label className="flex items-center gap-2 text-[#ff4d00] text-xs font-bold font-['Press_Start_2P'] uppercase mb-3">
                                        <span className="w-2 h-2 bg-[#ff4d00]"></span>
                                        Stop Loss %
                                    </label>
                                    <div className="tech-input-container flex items-center">
                                        <span className="pl-4 text-[#232d4b] font-bold">%</span>
                                        <input
                                            type="text"
                                            inputMode="decimal"
                                            value={slPercent}
                                            onChange={handleInputChange(setSlPercent)}
                                            className="w-full bg-transparent text-[#eef2f6] p-3 focus:outline-none font-mono text-xl placeholder-[#232d4b]"
                                            placeholder="1.0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>


                </div>

                {/* Right Column: Results */}
                <div className="lg:col-span-5 flex">
                    <div className="tech-border p-8 w-full flex flex-col justify-between items-center relative min-h-[300px] bg-[#0b1026]/50">
                        {/* Decorative Lines */}
                        <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#00f0ff] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-[#ff4d00] opacity-20"></div>

                        {result ? (
                            <div className="text-center w-full z-10 flex flex-col h-full justify-between">
                                <div className="flex-grow flex flex-col justify-center">
                                    <span className="block text-[#8b9bb4] text-xs uppercase tracking-[0.3em] mb-4">Target Leverage</span>
                                    <div className="text-6xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-[#00f0ff] to-[#0080ff] font-['Press_Start_2P'] drop-shadow-[0_0_15px_rgba(0,240,255,0.3)] break-all">
                                        {result.roundedLeverage}x
                                    </div>
                                </div>

                                <div className="space-y-4 w-full border-t border-[#232d4b] pt-8 mt-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#8b9bb4] text-sm uppercase">Position Size</span>
                                        <span className="text-[#eef2f6] text-xl font-mono">${result.positionSize.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#8b9bb4] text-sm uppercase">Risk Exposure</span>
                                        <span className="text-[#ff4d00] text-xl font-mono">{result.riskPercent.toFixed(2)}%</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-[#232d4b] text-center font-['Press_Start_2P'] text-sm animate-pulse m-auto">
                                SYSTEM READY
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Calculator;
