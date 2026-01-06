## Installation

1. Create virtual environment:
```bash
python -m venv venv

source venv/bin/activate  # Linux / macOS

# or
venv\Scripts\activate     # Windows
```

2. Install dependencies
```bash
pip install -r requirements.txt
```

3. Configure environment variables
   
Create or open the .env file in .\backend directory and set the required values

```bash
SECRET_KEY = 

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
REGION_NAME=
DOMAIN_MAIL=

API_V1_PREFIX=
FRONTEND_URL=

POSTGRES_USER=
POSTGRES_PASSWORD=
POSTGRES_SERVER=
POSTGRES_PORT=
POSTGRES_DB=
```

4. Run application
```bash
fastapi dev
```
API will be available at:

```bash
http://127.0.0.1:8000
```