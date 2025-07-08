# IntelliCart Chatbot Setup Guide

## What is this?
This guide will help you set up the IntelliCart chatbot on your local machine. The chatbot is built using Rasa framework and provides intelligent conversational capabilities for e-commerce interactions.

## Prerequisites
- Python 3.10 installed on your system
- Internet connection for downloading files and dependencies

## Setup Steps

### Step 1: Download Project Files
Download all the project files from the following Google Drive link and extract them to your working directory:
```
https://drive.google.com/drive/folders/101hwobx1LNsvNdGlVWJX9W_NCf_DKeM6?usp=drive_link
```

### Step 2: Navigate to Project Directory
Open your terminal/command prompt and navigate to the project folder:
```bash
cd intellicart-chatboat
```

**Important:** Make sure your folder structure matches the downloaded files exactly.

### Step 3: Create Virtual Environment
Create a Python virtual environment using Python 3.10:
```bash
py -3.10 -m venv .venv
```

### Step 4: Activate Virtual Environment
Activate the newly created virtual environment:
```bash
.venv\Scripts\activate
```

### Step 5: Install Dependencies
Install all required packages from the requirements file:
```bash
pip install --no-cache-dir -r requirements.txt
```

### Step 6: Start Rasa Server
Run the main Rasa server:
```bash
rasa run
```

You should see output similar to:
```
2025-06-25 08:30:39 INFO root - Rasa server is up and running.
```

### Step 7: Start Action Server
Open a new terminal window, navigate to the same directory, activate the virtual environment again, and run:
```bash
rasa run actions
```

You should see output similar to:
```
2025-06-25 08:26:25 INFO rasa_sdk.endpoint - Action endpoint is up and running on http://0.0.0.0:5055
```

## Verification
Once both servers are running:
- Rasa server will be available for handling conversations
- Action server will be running on `http://0.0.0.0:5055` for custom actions

Your IntelliCart chatbot is now ready to use!

## Troubleshooting
- Ensure Python 3.10 is installed and accessible via `py -3.10` command
- Make sure all files are downloaded and placed in the correct directory structure
- Verify that both virtual environment activation and package installation completed without errors