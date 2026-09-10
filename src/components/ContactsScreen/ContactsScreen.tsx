import React from 'react';
import { Search, UserPlus, Users } from 'lucide-react';
import { useContactStore } from '../../store/contactStore';
import { Button } from '../Common/Button';

interface ContactsScreenProps {
  onAddContact: () => void;
}

export const ContactsScreen: React.FC<ContactsScreenProps> = ({
  onAddContact,
}) => {
  const { contacts, isLoading, searchQuery, setSearchQuery } =
    useContactStore();

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.vpa.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-3xl mx-auto animate-fadeIn">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your saved payment contacts
          </p>
        </div>

        <Button
          onClick={onAddContact}
          leftIcon={<UserPlus className="w-4 h-4" />}
        >
          Add Contact
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search contacts..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-slate-500">
          Loading contacts...
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
          <p className="font-medium">No contacts found</p>
          <p className="text-sm text-slate-500 mt-1">
            Add a contact to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredContacts.map((contact) => (
            <div
              key={contact.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {contact.name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{contact.name}</p>
                <p className="text-sm text-slate-500 truncate">
                  {contact.vpa}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};