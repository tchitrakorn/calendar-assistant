# Calendar Assistant
Calendar Assistant is a Google Calendar management service with natural language processing capabilities. The service aims to help clients track, manage and optimize scheduling for both existing and upcoming events on their calendars. Enhanced with dialog ability, this service will not only support regular parameterized requests but also conversational prompts such as “Find an open slot on my calendar for a 30-min coffee chat with Ben this week.” The data store will be for user profiles, authentication tokens (required to access Google Calendar, OpenAI API, etc.), chat histories, and user feedback, all subject to user consent.

## Usage
To use our service, please make sure that you have obtained the following credentials:
1. Google Cloud Project’s client ID
2. Google Cloud Project’s client secret
3. OpenAI API key
   
To obtain the first two items, please visit [this site](https://developers.google.com/calendar/api/quickstart/python).
Make sure to choose a __web app__ and note down your credentials. 

Next, go to APIs & Services -> Credentials, find the app you just created, add `http://localhost:8080/oauth2callback` to its "Authorized redirect URIs." This would allow our /authenticate API endpoint to redirect you correctly. 

To obtain the OpenAI key, please visit [this site](https://platform.openai.com/docs/quickstart/add-your-api-key?context=python). Note that you need to have remaining credit on your account.

For more information on how to use our API, please see the following:
* [Full documentation](https://app.swaggerhub.com/apis-docs/Divide-n-Conquer/calendar-assistant/1.0.0)
* [Proposal (limited to LionMail users)](https://docs.google.com/document/d/17Qjl6t27rR_bs1J3gFUqawzSUAEYYyo7WWHOvfNo2GE/edit?usp=sharing)

## Getting Started
If you’re a developer who’s interested in running our code locally, feel free to download or clone our source code. Go to your terminal (and make sure that you're in the right directory) and enter the following commands:

### Installing dependencies
```
cd calendar-assistant
npm install
```
We also recommend using a virtual environment to handle the python packages, which can be found in `requirements.txt`.

### Setting up environment variables
To avoid exposing secrets, we recommend creating a .env file using our .env.example:
```
cp .env.example .env
```
Then, fill in the fields in your .env file.

### Setting up PostgreSQL
Start Postgres service and run the following:
1. Connect to the database: 
`psql -U your_username -d your_database`
2. Run our schema file: 
`\i src/database/schema.sql`
3. To quit Postgres: 
`\q`

### Starting the server
```
npm run server-dev
```
The server should be running on http://localhost:3000.

## Dependencies and tools
For our server, database, and testing setup, Calendar Assistant primarily uses:
* express
* express-validator
* eslint
* googleapis
* husky
* jest
* pg

For our calendar management logic, the python dependencies can be found in `requirements.txt`. We recommend having a virtual environment and do a `pip install -r requirements.txt`.

For our natural language processing capabilities, Calendar Assistant primarily uses:
* llama-index (for LLM and OpenAI)
  
Please see the following for additional information about LLM and LlamaIndex:
* [LlamaIndex introduction](https://ts.llamaindex.ai/)
* [LlamaIndex high-level concepts](https://gpt-index.readthedocs.io/en/latest/getting_started/concepts.html#high-level-concepts)

## Test Plan

### Unit tests
```
# To run all tests
python -m unittest discover

# To run with coverage
coverage run -m unittest discover
coverage report -m
```

### System tests
After you have started the server, you can go to our Postman test link [here](https://www.postman.com/speeding-crater-260064/workspace/team-workspace/collection/24382407-1efdb353-e3ac-429e-8601-0ae8c17c734a?action=share&creator=24382407) to test our API endpoints.

## Contributors
* [Karen Wang](https://github.com/karenswang)
* [Hao Lin](https://github.com/haolxx)
* [Tattie Chitrakorn](https://github.com/tchitrakorn)
* [Yiting Dai](https://github.com/LilyCuSO4)
