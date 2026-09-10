import { AddContactScreen } from './components/AddContactScreen/AddContactScreen';
import { ContactService } from './services/ContactService';
import { SignInModal } from './components/Auth/SignInModal';
import React, { useEffect } from 'react';
import { AppShell } from './components/Layout/AppShell';
import { PaymentInputScreen } from './components/PaymentInputScreen/PaymentInputScreen';
import { DisambiguationModal } from './components/DisambiguationModal/DisambiguationModal';
import { TransactionConfirmation } from './components/TransactionConfirmation/TransactionConfirmation';
import { ErrorScreen } from './components/ErrorScreen/ErrorScreen';
import { Dashboard } from './components/Dashboard/Dashboard';
import { LoadingSpinner } from './components/Common/LoadingSpinner';
import { Modal } from './components/Common/Modal';
import { Button } from './components/Common/Button';
import { ContactAvatar } from './components/Common/ContactAvatar';
import { useUserStore } from './store/userStore';
import { usePaymentStore } from './store/paymentStore';
import { useContactStore } from './store/contactStore';
import { useTransactionStore } from './store/transactionStore';
import { useUIStore } from './store/uiStore';
import { formatDate, formatCurrency } from './utils/formatters';
import { ContactsScreen } from './components/ContactsScreen/ContactsScreen';
import {
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Moon,
  Sun,
  UserCheck,
  LogOut,
} from 'lucide-react';
import { BigQuerySyncService } from './services/BigQuerySyncService';

export function App() {
  const [showAddContact, setShowAddContact] = React.useState(false);
  const [isAddingContact, setIsAddingContact] = React.useState(false);

  const { user, isDarkMode, toggleDarkMode, logoutUser } = useUserStore();

  const {
    isProcessing,
    activeTransaction,
    ambiguousContacts,
    originalMessage,
    currentError,
    retryCount,
    processPaymentPrompt,
    selectAmbiguousContact,
    retryPayment,
    proceedWithFraudWarning,
    resetPaymentState,
      clarificationTransactionId,
  clarificationOriginalRequestId,
  } = usePaymentStore();

  const {
    frequentContacts,
    fetchContacts,
    fetchFrequentContacts,
  } = useContactStore();

  const {
    transactions,
    fetchTransactions,
    selectedTransaction,
    setSelectedTransaction,
  } = useTransactionStore();

  const {
    activeTab,
    setActiveTab,
    addToast,
  } = useUIStore();
const handleNavigation = (tab: typeof activeTab) => {
  setShowAddContact(false);
  setActiveTab(tab);
};
  useEffect(() => {
    if (!user) return;

    fetchContacts(user.userId);
    fetchFrequentContacts(user.userId);
    fetchTransactions(user.userId);
  }, [user]);

  useEffect(() => {
  setShowAddContact(false);
  resetPaymentState();
}, [activeTab]);

  if (!user) {
    return <SignInModal isOpen={true} />;
  }

  const handleAddContact = async (name: string, vpa: string) => {
    try {
      setIsAddingContact(true);

      await ContactService.createContact(
        user.userId,
        name,
        vpa
      );

      await fetchContacts(user.userId);
      await fetchFrequentContacts(user.userId);

      addToast({
        type: 'success',
        message: `${name} added to your contacts successfully!`,
      });

      setShowAddContact(false);
    } catch (error) {
      console.error('Failed to add contact:', error);

      addToast({
        type: 'error',
        message: 'Failed to add contact. Please try again.',
      });
    } finally {
      setIsAddingContact(false);
    }
  };

  const handlePaymentSubmit = async (message: string) => {
    const success = await processPaymentPrompt(
      user.userId,
      message
    );

    if (success) {
      addToast({
        type: 'success',
        message: 'Payment completed successfully!',
      });

      fetchTransactions(user.userId);
    }
  };
const handleSelectContact = async (contactId: number) => {
const success = await selectAmbiguousContact(
  user.userId,
  contactId,
  clarificationTransactionId!,
  clarificationOriginalRequestId!
);
    if (success) {
      addToast({
        type: 'success',
        message: 'Contact selected and payment processed!',
      });

      fetchTransactions(user.userId);
    }
  };

  const handleRetry = async () => {
    const success = await retryPayment(user.userId);

    if (success) {
      addToast({
        type: 'success',
        message: 'Payment retry succeeded!',
      });

      fetchTransactions(user.userId);
    }
  };

  const handleFraudContinue = async () => {
    const success = await proceedWithFraudWarning(
      user.userId
    );

    if (success) {
      addToast({
        type: 'success',
        message: 'Payment completed successfully!',
      });

      fetchTransactions(user.userId);
    }
  };

  const handleBigQuerySync = async () => {
    try {
      await BigQuerySyncService.syncDatabase();

      addToast({
        type: 'success',
        message:
          'PostgreSQL data synced to BigQuery successfully!',
      });
    } catch (error) {
      console.error('BigQuery sync failed:', error);

      addToast({
        type: 'error',
        message: 'BigQuery synchronization failed.',
      });
    }
  };

  return (
    <AppShell>

      {/* Processing Spinner Overlay */}
      {isProcessing && (
        <LoadingSpinner
          fullScreen
          label="Processing natural language payment..."
        />
      )}

      {/* Disambiguation Modal Popup */}
      {ambiguousContacts && (
        <DisambiguationModal
          isOpen={!!ambiguousContacts}
          ambiguousContacts={ambiguousContacts}
          originalMessage={originalMessage}
          onSelect={handleSelectContact}
          onCancel={resetPaymentState}
        />
      )}

      {/* Main View Router */}

      {activeTransaction && activeTab === 'payment' ? (

        <TransactionConfirmation
          transactionId={activeTransaction.txnId}
          amount={activeTransaction.amount}
          recipientName={activeTransaction.recipientName}
          recipientVPA={activeTransaction.recipientVPA}
          newBalance={user.balance}
          timestamp={activeTransaction.timestamp}
          status={activeTransaction.status}
          onNewPayment={resetPaymentState}
          onViewDetails={() => {
            setSelectedTransaction(activeTransaction);
          }}
        />

      ) : showAddContact ? (

        /* Add Contact Screen */
        <AddContactScreen
          onBack={() => setShowAddContact(false)}
          onSave={handleAddContact}
          isLoading={isAddingContact}
        />

      ) : currentError ? (

        /* Error Screen */
        <ErrorScreen
          errorCode={currentError.code}
          errorMessage={currentError.message}
          errorDetails={currentError.details}
          suggestions={currentError.suggestions}
          retryCount={retryCount}
          onRetry={handleRetry}
          onContinue={handleFraudContinue}
          onDismiss={resetPaymentState}
          onAddContact={() => setShowAddContact(true)}
          onSuggest={(suggestion) => {
            resetPaymentState();
            handlePaymentSubmit(suggestion);
          }}
        />

      ) : activeTab === 'dashboard' ? (

        /* Dashboard */
        <Dashboard
          userId={user.userId}
          onPaymentClick={() => {
            resetPaymentState();
            setActiveTab('payment');
          }}
          onTransactionClick={(id) => {
            const txn = transactions.find(
              (t) => t.id === id
            );

            if (txn) {
              setSelectedTransaction(txn);
            }
          }}
        />

        ) : activeTab === 'contacts' ? (
  <ContactsScreen
    onAddContact={() => setShowAddContact(true)}
  />

      ) : activeTab === 'transactions' ? (

        /* History Page */
        <div className="space-y-6 animate-fadeIn">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
              Transaction History
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Full record of all sent and received payments
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">

            {[...transactions]
              .sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )
              .map((txn) => (

                <div
                  key={txn.id}
                  onClick={() =>
                    setSelectedTransaction(txn)
                  }
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                >

                  <div className="flex items-center space-x-3.5">

                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-primary flex items-center justify-center">
                      {txn.type === 'RECEIVED' ? (
                        <ArrowDownLeft className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <ArrowUpRight className="w-5 h-5 text-primary" />
                      )}
                    </div>

                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {txn.recipientName}
                      </h4>

                      <p className="text-xs text-slate-400 font-mono">
                        {formatDate(txn.timestamp)}
                      </p>
                    </div>

                  </div>

                  <div className="text-right">

                    <p className="font-bold font-mono text-sm text-slate-900 dark:text-slate-100">
                      {txn.type === 'RECEIVED'
                        ? '+'
                        : '-'}
                      {formatCurrency(txn.amount)}
                    </p>

                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full">
                      {txn.status}
                    </span>

                  </div>

                </div>

              ))}

          </div>
        </div>

      ) : activeTab === 'settings' ? (

        /* Settings Page */
        <div className="space-y-6 max-w-xl mx-auto animate-fadeIn">

          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white font-heading">
              Settings & Profile
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Account preferences and security
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">

            <div className="flex items-center space-x-4">

              <ContactAvatar
                name={user.name}
                avatarUrl={user.avatar}
                size="xl"
              />

              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {user.name}
                </h3>

                <p className="text-xs text-slate-500 font-mono">
                  {user.upiId}
                </p>

                <p className="text-xs text-slate-400">
                  {user.phone} • {user.email}
                </p>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">

              <div className="flex justify-between items-center">

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Dark Theme
                  </h4>

                  <p className="text-xs text-slate-400">
                    Toggle dark mode visual interface
                  </p>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={toggleDarkMode}
                >
                  {isDarkMode ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-slate-700" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={logoutUser}
                  leftIcon={
                    <LogOut className="w-4 h-4" />
                  }
                >
                  Sign Out
                </Button>

              </div>

              <div className="flex justify-between items-center">

                <div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    UPI PIN & Security
                  </h4>

                  <p className="text-xs text-slate-400">
                    256-bit AES end-to-end encrypted
                  </p>
                </div>

                <span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  Protected
                </span>

              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">

                <div className="flex justify-between items-center">

                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                      BigQuery Synchronization
                    </h4>

                    <p className="text-xs text-slate-400">
                      Sync PostgreSQL data to BigQuery analytics
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleBigQuerySync}
                  >
                    Sync Now
                  </Button>

                </div>

              </div>

            </div>

          </div>
        </div>

      ) : (

        /* Default Payment Input Screen */
        <PaymentInputScreen
          userId={user.userId}
          onPaymentSubmit={handlePaymentSubmit}
          isLoading={isProcessing}
          userBalance={user.balance}
          recentPayees={frequentContacts}
          onCheckBalance={() =>
            setActiveTab('dashboard')
          }
          onRecentTransactions={() =>
            setActiveTab('transactions')
          }
          onAddContact={() =>
            setShowAddContact(true)
          }
        />

      )}

      {/* Transaction Details Modal */}
      {selectedTransaction && (
        <Modal
          isOpen={!!selectedTransaction}
          onClose={() =>
            setSelectedTransaction(null)
          }
          title="Transaction Details"
          maxWidth="md"
        >

          <div className="space-y-4 text-sm">

            <div className="text-center py-2">

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                ✅ {selectedTransaction.status}
              </span>

              <h2 className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-2">
                {formatCurrency(
                  selectedTransaction.amount
                )}
              </h2>

              <p className="text-sm text-slate-500 font-semibold mt-0.5">
                {selectedTransaction.recipientName}
              </p>

            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 border border-slate-100 dark:border-slate-700 text-xs">

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Txn ID:
                </span>

                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {selectedTransaction.txnId}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  Date:
                </span>

                <span className="text-slate-800 dark:text-slate-200">
                  {formatDate(
                    selectedTransaction.timestamp
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">
                  UPI VPA:
                </span>

                <span className="font-mono text-slate-800 dark:text-slate-200">
                  {selectedTransaction.recipientVPA}
                </span>
              </div>

              {selectedTransaction.note && (
                <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-slate-700">

                  <span className="text-slate-400">
                    NL Command:
                  </span>

                  <span className="italic text-slate-800 dark:text-slate-200">
                    "{selectedTransaction.note}"
                  </span>

                </div>
              )}

            </div>

            <Button
              variant="primary"
              onClick={() =>
                setSelectedTransaction(null)
              }
              className="w-full"
            >
              Close Details
            </Button>

          </div>

        </Modal>
      )}

    </AppShell>
  );
}

export default App;