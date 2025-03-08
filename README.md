# Brunchinator BackEnd

## Overview

Brunchinator BackEnd is the server-side component of the Brunchinator application, responsible for managing data operations, business logic, and integration with external services. 
This repository complements the [Brunchinator FrontEnd](https://github.com/brunchinatorMaster/brunchinatorAngular) to deliver a seamless user experience.

## Features

- **User Authentication**: Secure user registration and login functionalities.
- **Data Management**: Efficient handling of application data with CRUD operations.
- **API Integration**: Seamless communication with external APIs and services.
- **Error Handling**: Robust error management for reliable application performance.

## Technologies Used

- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web application framework for Node.js.
- **DynamoDB**: NoSQL database for data storage.
- **AWS S3**: Amazon Web Services S3 for file storage and retrieval.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [MongoDB](https://www.mongodb.com/) (version 4.x or higher)
- AWS account with S3 access

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/brunchinatorMaster/brunchinatorBackEnd.git
   cd brunchinatorBackEnd
   ```   
2. **Install dependencies**:
  
   ```bash
   npm install
   ```
2. **Set up environment variables**:

Create a file named awsconfig.js with the following:
   ```bash
   const config = {
      region: YOUR_REGION,
      accessKeyId: YOUR_ACCESS_KEY_ID,
      secretAccessKey: YOUR_SECRET_ACCESS_KEY,
   };

   module.exports = {
      config
   }
   ```
4. **Start the server:s**:

```bash
  npm start
```

## Project Structure
```bash
brunchinatorBackEnd/
├── controllers/        # Route handlers
├── databaseAccess/     # Database interaction logic
├── errors/             # Custom error classes
├── handlers/           # Middleware functions
├── mockDataBase/       # Mock data for testing
├── s3Access/           # AWS S3 integration logic
├── schemas/            # Data validation schemas
├── test/               # Test cases
├── utils/              # Utility functions
├── app.js              # Application entry point
├── package.json        # Project metadata and dependencies
└── server.js           # Server configuration
```

## Contact
For questions or support, please contact [brunchinatormaster@gmail.com].





