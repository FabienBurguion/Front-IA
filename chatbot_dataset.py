from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import autogen

import uvicorn

app = FastAPI()

config_list = [
    {
        "model": "llama3.2",
        "base_url": "http://localhost:11434/v1",
        "api_key": "ollama",
    }
]

botanist_prompt = """
You are a Botanical Expert.
Give
    1. Give brief Nutritional value.
    2. Give one expert tip on how to preserve it to avoid waste.
    3. Give one fun fact.
Stay under 60 words.
"""

chef_prompt = """
You are a culinary chef.
Give:
    1. A simple recipe.
    2. A 3-course menu (Starter, Main, Dessert)
Keep answers concise.
"""

class ChatRequest(BaseModel):
    fruit: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    fruit_name = request.fruit.strip().lower()

    botanist = autogen.AssistantAgent(
        name="Botanist",
        llm_config={"config_list": config_list},
        system_message=botanist_prompt
    )
    chef = autogen.AssistantAgent(
        name="MealPlanner",
        llm_config={"config_list": config_list},
        system_message=chef_prompt
    )

    user_proxy = autogen.UserProxyAgent(
        name="User",
        system_message="A user providing fruit/vegetable names.",
        human_input_mode="NEVER",
        code_execution_config=False,
        max_consecutive_auto_reply=1
    )

    groupchat = autogen.GroupChat(
        agents=[user_proxy, botanist, chef],
        messages=[],
        max_round=3,
        speaker_selection_method="round_robin"
    )
    manager = autogen.GroupChatManager(groupchat=groupchat, llm_config={"config_list": config_list})

    user_proxy.initiate_chat(
        manager,
        message=f"The fruit is: {fruit_name}."
    )

    history = []
    for msg in groupchat.messages:
        if msg['name'] in ['Botanist', 'MealPlanner']:
            history.append({"agent": msg['name'], "content": msg['content']})

    return {"fruit": fruit_name, "responses": history}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
