from fireworks.client import Fireworks

api_key = "fw_3ZWxzEAsPrjYMJ9egqWwaQvt"
api_key2 = "fw_3ZRvGMzSEYCB8jKG4yLBhT8h"
client = Fireworks(api_key=api_key2)

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