# Nomad-Market — Decentralized Marketplace on Solana Blockchain

![Solana](frontend/src/img/solana.png) 

## About the Project

Nomad-Market is a decentralized trading platform on the Solana blockchain that allows users to create, sell, and buy digital assets. The platform uses simulated blockchain technology with virtual wallets, listing tokenization, and an escrow system for secure transactions.

### Key Features
- 🛒 Create and browse digital asset listings
- 💰 Virtual Solana wallets for each user
- 🔐 Listing tokenization through NFT system
- ⚡ Secure transactions via escrow smart contract
- 📊 Real-time Solana price display in USD and KZT (CoinGecko API integration)
- 👨‍💼 Admin panel for content moderation and user management

## Tech Stack

### Frontend
- **React 19** + React Router 7
- **Tailwind CSS** for styling with custom Solana-inspired design
- **Axios** for API requests
- **CoinGecko API** for real-time cryptocurrency rates

### Backend
- **Node.js** with Express.js for API
- **PostgreSQL** for storing users, listings, and transactions data
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** for image file handling

## Database Structure
- **users**: System users (credentials, wallets, balances)
- **listings**: Marketplace listings and items
- **tokens**: NFT tokens representing digital assets
- **transactions**: History of all system transactions
- **notifications**: User notification system

## Running the Project (Locally)

### Requirements
- Node.js 18+
- PostgreSQL 14+

### Database Setup
1. Create `nomad_market` database (or specify your own name in `.env`)

### Backend Setup
1. Create `backend/.env` file following this example:
```
PORT=4000
CLIENT_ORIGIN=http://localhost:3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=nomad_market
JWT_SECRET=change_me_secret
```

2. Installation and launch:
```bash
cd backend
npm install
npm start
```

On first launch, the server will automatically create all necessary tables.
API will be available at: http://localhost:4000

### Frontend Setup
1. Create `frontend/.env` file following this example:
```
REACT_APP_API_URL=http://localhost:4000
```

2. Installation and launch:
```bash
cd frontend
npm install
npm start
```

Application will be available at: http://localhost:3000

## Pages and Features

### For All Users
- **Home Page** (`/`): Product listings with search and filter capabilities
- **Authentication Page** (`/auth`): User login and registration
- **About Page** (`/about`): Platform information with real-time Solana price display

### For Authenticated Users
- **Create Listing** (`/create`): Form for adding new items
- **My Listings** (`/my`): Manage your own listings
- **Profile** (`/profile`): Personal profile management
- **Wallet**: View balance, transactions, and notifications with Solana price in USD and KZT

### For Administrators
- **Admin Panel** (`/admin`): System management
  - Listing moderation
  - User management
  - Transaction monitoring

## User Accounts
- **Administrator**: Created automatically on first launch
  - Email: `admin@nomad-market.local`
  - Password: `Admin123!`
- **Regular User**: Register through `/auth` page

## Key Functions and Endpoints

### Authentication
- `POST /auth/register` - registration `{ email, password, nickname }`
- `POST /auth/login` - login `{ email, password }`

### Listings
- `GET /listings` - get listings list (filters: `q`, `minPrice`, `maxPrice`, `owner`)
- `POST /listings` - create listing (multipart: `image`, `title`, `description`, `price`)
- `PUT /listings/:id` - update your listing
- `DELETE /listings/:id` - delete your listing
- `GET /listings/:id/image` - get listing image

### Transactions and Tokens
- `POST /listings/:id/mint` - create token (NFT) for listing
- `POST /purchase` - purchase listing `{ listingId }`
- `GET /wallet/:id` - wallet info, tokens, transactions, and notifications

### Administrative Functions
- `GET /admin/listings` - all listings in the system
- `DELETE /admin/listings/:id?reason=...` - delete listing with reason
- `GET /admin/users` - all users
- `GET /admin/users/:id/transactions` - specific user's transactions
- `DELETE /admin/users/:id` - delete user

## Tokenization and Transaction System

### NFT Marketplace Workflow:
1. **Seller uploads asset** (image or other digital content)
2. **Tokenization**: System creates NFT representing this asset
3. **Listing on Nomad-Market**: Item is listed on platform with specified price
4. **Purchase**: User selects NFT and sends SOL through wallet
5. **Escrow Smart Contract**: Holds funds until token is ready for transfer
6. **Distribution**: Contract automatically transfers token to buyer and funds to seller

Key Feature: Transaction is atomic — either both parties receive what was promised, or the transaction is completely cancelled.

## Future Development

Current version uses Solana blockchain simulation. For full integration with actual blockchain, the following is needed:

1. Integration with real Solana wallets (Phantom, Solflare)
2. Development and deployment of smart contracts on Solana (using Anchor Framework)
3. Integration with Solana RPC API for blockchain operations
4. Implementation of real tokenization and NFTs on blockchain

## Additional Security Recommendations
- Use HTTPS for all connections
- Update CORS settings for production environment
- Store images in external object storage (S3, Firebase Storage)
- Use database migration systems for schema versioning

---

© 2025 Nomad Market. Project created to demonstrate blockchain technology capabilities.
