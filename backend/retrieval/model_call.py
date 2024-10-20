from fireworks.client import Fireworks
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("FIREWORKS_API_KEY")
client = Fireworks(api_key=api_key)

LLAMA_70B="accounts/fireworks/models/llama-v3p1-70b-instruct"
LLAMA_8B="accounts/fireworks/models/llama-v3p1-8b-instruct"

def call_model(model, sys_msg):
  response = client.chat.completions.create(
    model=model,
    messages=[{
      "role": "user",
      "content": sys_msg,
    }],
    temperature=0,
  )

  return response.choices[0].message.content

async def async_call_model(model, sys_msg):
  response = client.chat.completions.create(
    model=model,
    messages=[{
      "role": "user",
      "content": sys_msg,
    }],
    temperature=0,
  )

  return response.choices[0].message.content