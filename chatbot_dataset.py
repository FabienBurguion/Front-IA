from fastapi import FastAPI
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

classifier_prompt = """
You are a classification tool.
Analyze the user input.
If it is an edible fruit, vegetable, or herb used in cooking, reply EXACTLY: "fruit".
If it is a houseplant, flower, or decorative tree, reply EXACTLY: "plant".
Do not write anything else. No punctuation.
"""

botanist_prompt_fruit = """
You are a Botanical Expert regarding edible plants.
Give:
    1. Brief Nutritional value (Calories/Vitamins).
    2. One expert tip on how to preserve it.
    3. One fun fact.
Stay under 60 words.
"""

botanist_prompt_plant = """
You are a Houseplant Expert.
Give:
    1. Watering requirements (frequency).
    2. Light requirements (direct/indirect).
    3. Soil recommendation.
    4. One common mistake to avoid.
Stay under 60 words.
"""

chef_prompt = """
You are a culinary chef.
Give:
    1. A simple recipe idea.
    2. A quick menu suggestion (Starter/Main/Dessert).
Keep answers concise.
"""

class ChatRequest(BaseModel):
    name: str

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    item_name = request.name.strip()

    classifier = autogen.AssistantAgent(
        name="Classifier",
        llm_config={"config_list": config_list},
        system_message=classifier_prompt
    )

    user_proxy_detect = autogen.UserProxyAgent(
        name="User_Detector",
        human_input_mode="NEVER",
        max_consecutive_auto_reply=1,
        code_execution_config=False
    )

    user_proxy_detect.initiate_chat(
        classifier,
        message=f"{item_name}",
        max_turns=1
    )

    detected_category = user_proxy_detect.last_message(classifier)["content"].strip().lower()

    if "plant" in detected_category:
        category = "plant"
    else:
        category = "fruit"

    print(f"DEBUG: '{item_name}' detected as '{category}'")

    agents_list = []

    user_proxy_chat = autogen.UserProxyAgent(
        name="User",
        system_message="A user asking for information.",
        human_input_mode="NEVER",
        code_execution_config=False,
        max_consecutive_auto_reply=1
    )
    agents_list.append(user_proxy_chat)

    if category == "plant":
        botanist = autogen.AssistantAgent(
            name="Botanist",
            llm_config={"config_list": config_list},
            system_message=botanist_prompt_plant
        )
        agents_list.append(botanist)
    else:
        botanist = autogen.AssistantAgent(
            name="Botanist",
            llm_config={"config_list": config_list},
            system_message=botanist_prompt_fruit
        )
        chef = autogen.AssistantAgent(
            name="MealPlanner",
            llm_config={"config_list": config_list},
            system_message=chef_prompt
        )
        agents_list.extend([botanist, chef])

    groupchat = autogen.GroupChat(
        agents=agents_list,
        messages=[],
        max_round=3 if category == "fruit" else 2,
        speaker_selection_method="round_robin"
    )
    manager = autogen.GroupChatManager(groupchat=groupchat, llm_config={"config_list": config_list})

    user_proxy_chat.initiate_chat(
        manager,
        message=f"Tell me about: {item_name}."
    )

    history = []
    for msg in groupchat.messages:
        if msg['name'] in ['Botanist', 'MealPlanner']:
            history.append({"agent": msg['name'], "content": msg['content']})

    return {
        "name": item_name,
        "detected_category": category,
        "responses": history
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)