# Card Fill Components

This directory contains reusable components for credit card and bank-related forms.

## Components

### BankSelection

A reusable component for selecting or creating banks.

#### Props

- `onBankSelect` (function): Callback function that receives the selected bank data when a bank is selected
  - Receives `null` when selection is cleared
  - Receives bank object with `bank_id` and `bank_name` when a bank is selected

- `className` (string, optional): Additional CSS classes to apply to the component container
  - Default: `""`

- `showCreateOption` (boolean, optional): Whether to show the "Add New Bank" option
  - Default: `true`

- `apiUrl` (string, optional): Base URL for the API endpoints
  - Default: `"https://zapia-backend-fuang8emcbdxhhau.centralindia-01.azurewebsites.net"`

#### Usage Example

```jsx
import { BankSelection } from './components/components_card_fill';

function MyForm() {
  const [selectedBank, setSelectedBank] = useState(null);

  const handleBankSelect = (bankData) => {
    setSelectedBank(bankData);
    console.log('Selected bank:', bankData);
  };

  return (
    <BankSelection 
      onBankSelect={handleBankSelect}
      showCreateOption={true}
      apiUrl="https://zapia-backend-fuang8emcbdxhhau.centralindia-01.azurewebsites.net"
      className="my-custom-class"
    />
  );
}
```

#### Features

- Fetches banks from API on component mount
- Dropdown selection of existing banks
- Option to create new banks inline
- Loading states
- Error handling
- Success messages
- Automatic refresh after creating new bank
- Responsive design with Tailwind CSS

#### API Endpoints Used

- `GET /banks` - Fetches list of all banks
- `POST /banks` - Creates a new bank (requires `bank_name` in request body)

#### Styling

The component uses Tailwind CSS classes for styling. Make sure Tailwind CSS is properly configured in your project.