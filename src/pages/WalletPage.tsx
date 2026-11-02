import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  ShieldCheck, 
  Download, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  FileText, 
  Printer, 
  ExternalLink,
  ChevronDown,
  Gift
} from 'lucide-react';
import { Wallet, WalletTransaction, Currency } from '../types';
import { CURRENCY_RATES, formatPrice, convertFromUSD } from '../lib/currency';
import { trackEvent } from '../lib/analytics';

export const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [displayCurrency, setDisplayCurrency] = useState<Currency>('USD');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedReferral, setCopiedReferral] = useState<boolean>(false);
  const [showReferralModal, setShowReferralModal] = useState<boolean>(false);
  const [showStatementModal, setShowStatementModal] = useState<boolean>(false);
  const [statementData, setStatementData] = useState<any | null>(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes] = await Promise.all([
        fetch('/api/wallet?userId=current_user'),
        fetch('/api/wallet/transactions?userId=current_user'),
      ]);

      const walletJson = await walletRes.json();
      const txJson = await txRes.json();

      setWallet(walletJson);
      setTransactions(txJson.transactions || []);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesType = 
        filterType === 'all' ? true :
        filterType === 'topup' ? tx.type === 'topup' :
        filterType === 'payment' ? tx.type === 'payment' :
        filterType === 'refund' ? tx.type === 'refund' :
        filterType === 'credits' ? ['referral_credit', 'promo_credit', 'admin_adjustment'].includes(tx.type) : true;

      const matchesSearch = 
        tx.narration.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.paymentProvider && tx.paymentProvider.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesType && matchesSearch;
    });
  }, [transactions, filterType, searchTerm]);

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Reference', 'Type', 'Direction', 'Amount_USD', 'Currency', 'Status', 'Provider', 'Narration'];
    const rows = transactions.map((t) => [
      t.createdAt.split('T')[0],
      t.reference,
      t.type,
      t.direction,
      t.amount.toFixed(2),
      t.currency,
      t.status,
      t.paymentProvider || 'N/A',
      `"${t.narration.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Ganda_Wallet_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Open Monthly Statement Modal
  const handleOpenStatement = async () => {
    try {
      const res = await fetch('/api/wallet/statement?userId=current_user');
      const data = await res.json();
      setStatementData(data);
      setShowStatementModal(true);
    } catch (err) {
      console.error('Error fetching statement:', err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2500);
  };

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-900 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified Customer Travel Ledger</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Ganda Safari Wallet
            </h1>
            <p className="text-stone-600 text-sm">
              Manage your East African safari credits, escrow deposits, and referral rewards.
            </p>
          </div>

          {/* Currency Switcher */}
          <div className="flex items-center gap-3 self-start sm:self-auto bg-white p-1.5 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-xs font-medium text-stone-500 pl-2">Display:</span>
            <div className="flex gap-1">
              {(['USD', 'TZS', 'UGX', 'KES', 'EUR', 'GBP'] as Currency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setDisplayCurrency(curr)}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                    displayCurrency === curr
                      ? 'bg-amber-900 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Suspended Wallet Warning if applicable */}
        {wallet?.status === 'suspended' && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm">
              <strong>Wallet Temporarily Suspended:</strong> For your security, automated transactions are currently paused following high-frequency activity. Please contact founder Akim Mmari via WhatsApp at +255 784 123 456 to verify and reactivate.
            </div>
          </div>
        )}

        {/* Balance Hero Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 1. Available Balance */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-2xl p-6 shadow-sm border border-stone-800 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Available Safari Balance
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Book
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-white mb-2">
                {formatPrice(wallet?.availableBalance || 0, displayCurrency)}
              </div>
              <div className="text-xs text-stone-400 font-mono">
                Base: ${wallet?.availableBalance?.toLocaleString() || '0'} USD
              </div>
              <div className="mt-6 flex items-center gap-2">
                <Link
                  to="/wallet/topup"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-sm transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Top-Up Wallet
                </Link>
                <Link
                  to="/itineraries"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-medium transition-colors"
                >
                  Browse Circuits
                </Link>
              </div>
            </div>
          </div>

          {/* 2. In Escrow Hold */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-600" /> In Escrow Hold
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                  Pending Verification
                </span>
              </div>
              <div className="text-3xl font-mono font-bold text-stone-900 mb-1">
                {formatPrice(wallet?.holdBalance || 0, displayCurrency)}
              </div>
              <div className="text-xs text-stone-500 font-mono">
                Base: ${wallet?.holdBalance?.toLocaleString() || '0'} USD
              </div>
            </div>
            <div className="pt-4 border-t border-stone-100 mt-4 text-xs text-stone-500 leading-relaxed">
              Deposits held securely until Akim confirms vehicle allocation and locks in statutory gorilla permits.
            </div>
          </div>

          {/* 3. Total Balance & Quick Actions */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                  Total Safari Credits
                </span>
                <span className="text-xs text-stone-400 font-mono">{wallet?.id}</span>
              </div>
              <div className="text-3xl font-mono font-bold text-stone-900 mb-1">
                {formatPrice(wallet?.balance || 0, displayCurrency)}
              </div>
              <div className="text-xs text-stone-500 font-mono">
                Base: ${wallet?.balance?.toLocaleString() || '0'} USD
              </div>
            </div>

            <div className="pt-4 border-t border-stone-100 mt-4 flex items-center gap-2">
              <button
                onClick={handleOpenStatement}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" /> PDF Statement
              </button>
              <button
                onClick={() => setShowReferralModal(true)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-medium transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" /> Share $50 Gift
              </button>
            </div>
          </div>
        </div>

        {/* Escrow Transparency Manifesto Card */}
        <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-800 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm text-stone-900">
                Our Escrow & Non-Banking Guarantee
              </h4>
              <p className="text-xs text-stone-700 mt-0.5 leading-relaxed max-w-2xl">
                Ganda Safaris is an independent boutique safari tour operator, not a bank. All balances are dedicated travel credits. Deposits stay in escrow until founder Akim personally confirms lodge availability and secures statutory gorilla permits.
              </p>
            </div>
          </div>
          <Link
            to="/wallet/terms"
            className="whitespace-nowrap px-4 py-2 rounded-lg bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-950 text-xs font-bold transition-colors"
          >
            Review Transparency Terms &rarr;
          </Link>
        </div>

        {/* Transaction Ledger Table Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
          {/* Header and Filters */}
          <div className="p-6 border-b border-stone-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900 font-serif">
                  Immutable Transaction Ledger
                </h3>
                <p className="text-xs text-stone-500">
                  Append-only audit history of all wallet top-ups, escrow holds, and credits.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by reference, booking, or narration..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'topup', label: 'Top-ups' },
                  { id: 'payment', label: 'Escrow Holds' },
                  { id: 'refund', label: 'Refunds' },
                  { id: 'credits', label: 'Promo/Referral' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      filterType === tab.id
                        ? 'bg-white text-stone-900 shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Transactions List */}
          {loading ? (
            <div className="p-12 text-center text-sm text-stone-500">
              Loading wallet ledger...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <WalletIcon className="w-8 h-8 text-stone-400 mx-auto" />
              <p className="text-sm font-semibold text-stone-800">No transactions found</p>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No ledger entries match your filter. Top-up your wallet or book a circuit to see your history.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-stone-600">
                <thead className="bg-stone-50 text-stone-500 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Reference</th>
                    <th className="py-3 px-4">Narration</th>
                    <th className="py-3 px-4">Provider</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredTransactions.map((tx) => {
                    const isCredit = tx.direction === 'credit';
                    return (
                      <tr key={tx.id} className="hover:bg-stone-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap text-stone-500 font-mono">
                          {tx.createdAt.split('T')[0]}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {tx.type === 'topup' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              <ArrowDownLeft className="w-3 h-3" /> Top-Up
                            </span>
                          )}
                          {tx.type === 'payment' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              <Lock className="w-3 h-3" /> Escrow Hold
                            </span>
                          )}
                          {tx.type === 'refund' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                              <ArrowDownLeft className="w-3 h-3" /> Refund
                            </span>
                          )}
                          {['referral_credit', 'promo_credit'].includes(tx.type) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800">
                              <Gift className="w-3 h-3" /> Safari Reward
                            </span>
                          )}
                          {tx.type === 'admin_adjustment' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-800">
                              HQ Adjustment
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-semibold text-stone-800 whitespace-nowrap">
                          {tx.reference}
                        </td>
                        <td className="py-3.5 px-4 text-stone-800 max-w-xs truncate">
                          {tx.narration}
                        </td>
                        <td className="py-3.5 px-4 text-stone-500 uppercase font-semibold text-[10px]">
                          {tx.paymentProvider || 'Internal'}
                        </td>
                        <td className={`py-3.5 px-4 text-right font-mono font-bold whitespace-nowrap ${
                          isCredit ? 'text-emerald-600' : 'text-stone-800'
                        }`}>
                          {isCredit ? '+' : '-'}{formatPrice(tx.amount, displayCurrency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Share Referral Code Modal */}
        {showReferralModal && (
          <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div className="flex items-center gap-2 text-amber-900 font-serif font-bold text-lg">
                  <Gift className="w-5 h-5" />
                  <span>Ganda Safari Referral Club</span>
                </div>
                <button
                  onClick={() => setShowReferralModal(false)}
                  className="text-stone-400 hover:text-stone-600 text-sm font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="text-center space-y-2">
                <h3 className="text-xl font-serif font-bold text-stone-900">
                  Give $50 USD, Earn $50 USD
                </h3>
                <p className="text-xs text-stone-600">
                  Share your personalized referral code with friends planning a trip to East Africa. When they book their first safari, they receive $50 USD off their 30% deposit, and we credit $50 USD into your wallet!
                </p>
              </div>

              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center space-y-2">
                <span className="text-[11px] font-semibold text-amber-800 block">Your Exclusive Referral Code</span>
                <div className="text-2xl font-mono font-bold text-amber-950 tracking-wider">
                  GANDA-EXPLORER-88
                </div>
                <button
                  onClick={() => copyToClipboard('GANDA-EXPLORER-88')}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-bold hover:bg-amber-800 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedReferral ? 'Copied to Clipboard!' : 'Copy Code'}
                </button>
              </div>

              <div className="text-[11px] text-stone-500 text-center">
                Credits never expire and can be applied directly toward gorilla permits or lodge upgrades.
              </div>
            </div>
          </div>
        )}

        {/* Monthly PDF Statement Modal / Print View */}
        {showStatementModal && statementData && (
          <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8 space-y-6 max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:p-0">
              
              {/* Statement Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 print:hidden">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                  Safari Travel Credit Statement
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                  </button>
                  <button
                    onClick={() => setShowStatementModal(false)}
                    className="px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-800 text-sm font-bold"
                  >
                    &times; Close
                  </button>
                </div>
              </div>

              {/* Official Letterhead */}
              <div className="flex justify-between items-start border-b border-stone-200 pb-6">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-stone-900">
                    {statementData.operator}
                  </h2>
                  <p className="text-xs text-stone-600 mt-1">{statementData.headquarters}</p>
                  <p className="text-xs text-stone-500">Tourism License: {statementData.license}</p>
                  <p className="text-xs text-stone-500">Contact: Akim Mmari (+255 784 123 456)</p>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 block mb-2">
                    TRAVEL CREDIT STATEMENT
                  </span>
                  <div className="text-xs text-stone-500 font-mono">
                    Date: {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Account Overview */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <span className="text-stone-500 block">Account Holder:</span>
                  <strong className="text-stone-900">{statementData.accountHolder}</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Total Credits:</span>
                  <strong className="text-emerald-700">${statementData.totalCredits} USD</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Held in Escrow:</span>
                  <strong className="text-amber-800">${statementData.holdBalance} USD</strong>
                </div>
                <div>
                  <span className="text-stone-500 block">Available Balance:</span>
                  <strong className="text-stone-900">${statementData.availableBalance} USD</strong>
                </div>
              </div>

              {/* Statement Transactions */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700">
                  Statement Line Items
                </h4>
                <div className="border border-stone-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-stone-100 text-stone-600 font-semibold border-b border-stone-200">
                      <tr>
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Reference</th>
                        <th className="py-2 px-3">Narration</th>
                        <th className="py-2 px-3 text-right">Amount (USD)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 font-mono">
                      {statementData.transactions.map((tx: any) => (
                        <tr key={tx.id}>
                          <td className="py-2 px-3">{tx.createdAt.split('T')[0]}</td>
                          <td className="py-2 px-3 font-semibold">{tx.reference}</td>
                          <td className="py-2 px-3 font-sans text-stone-800">{tx.narration}</td>
                          <td className={`py-2 px-3 text-right font-bold ${
                            tx.direction === 'credit' ? 'text-emerald-700' : 'text-stone-900'
                          }`}>
                            {tx.direction === 'credit' ? '+' : '-'}${tx.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Legal Notice */}
              <div className="pt-4 border-t border-stone-200 text-[10px] text-stone-500 leading-relaxed">
                Ganda Safaris and Holiday Ltd operates in Arusha, Tanzania under TTBL License #TTBL-TZ-2018-842. Balances represent dedicated safari travel credits and are not bank deposits. Deposits held in escrow are subject to lodge availability and statutory UWA/RDB permit quotas.
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
