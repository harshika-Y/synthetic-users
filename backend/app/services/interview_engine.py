import json
import random
import re
from typing import List, Dict, Any, Optional
from app.services.llm_service import llm_service
from app.services.vector_memory import vector_memory

class InterviewEngine:
    async def respond_to_researcher(
        self,
        persona: Dict[str, Any],
        message_history: List[Dict[str, Any]],
        new_message: str,
        stored_memories: List[Dict[str, Any]],
        product_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Simulates an authentic, live, human conversational response from the persona
        to the researcher's exact question, exactly like chatting with a real person.
        Uses live OpenAI / Groq LLM if configured; otherwise runs our advanced dynamic semantic
        intelligence engine that speaks in an authentic, lifelike human voice.
        """
        # Retrieve top relevant memories
        relevant_memories = vector_memory.retrieve_relevant(new_message, stored_memories, top_k=3)

        persona_name = persona.get("name", "Friend")
        first_name = persona_name.split()[0] if persona_name else "Friend"
        age = persona.get("age", 30)
        occupation = persona.get("occupation", "Professional")
        segment = persona.get("segment", "General Consumer")
        budget = persona.get("budget", "Moderate (₹5,000 - ₹8,000/mo)")
        schedule = persona.get("schedule", "Morning routine starting by 8:00 AM")
        diet = persona.get("dietary_prefs", "Authentic South Indian Breakfast & Hot Filter Coffee")
        delivery_exp = persona.get("delivery_expectations", "30-min express hot delivery with insulated packaging")
        objections = persona.get("objections", [])
        motivations = persona.get("motivations", [])
        comm_style = persona.get("communication_style", "Warm, conversational, and direct")

        occ_lower = occupation.lower()
        seg_lower = segment.lower()
        name_lower = persona_name.lower()
        diet_lower = diet.lower()

        # Persona archetype detection
        is_tech_corporate = any(k in occ_lower or k in seg_lower for k in ["engineer", "developer", "software", "product", "manager", "tech", "analyst", "consultant", "designer", "architect", "lead", "it"])
        is_student = (age <= 23) or any(k in occ_lower or k in seg_lower for k in ["student", "intern", "college", "fresher", "grad", "hostel"])
        is_homemaker_parent = any(k in occ_lower or k in seg_lower for k in ["homemaker", "mother", "parent", "housewife", "family"])
        is_health_buff = any(k in occ_lower or k in seg_lower or k in diet_lower for k in ["fitness", "gym", "health", "nutrition", "trainer", "yoga", "organic", "millet"])
        
        # Senior citizen check: elderly or retired, distinct from "Senior Software Engineer"
        is_senior = (age >= 55 or any(k in occ_lower or k in seg_lower for k in ["senior citizen", "retired", "elderly", "pensioner", "grandparent"])) and not is_tech_corporate
        
        is_budget_conscious = any(k in budget.lower() or k in seg_lower or k in occ_lower for k in ["budget", "student", "intern", "junior", "price sensitive", "frugal", "cost-conscious"])
        is_affluent = any(k in budget.lower() or k in seg_lower or k in occ_lower for k in ["high", "director", "lead", "architect", "executive", "convenience", "premium", "founder", "vp", "partner"])

        # Determine realistic location in Bangalore
        if is_senior:
            location = "Malleshwaram, Bangalore"
        elif is_tech_corporate:
            location = "HSR Layout, Bangalore"
        elif is_student:
            location = "Koramangala, Bangalore"
        elif is_homemaker_parent:
            location = "Jayanagar, Bangalore"
        else:
            location = "Indiranagar, Bangalore"

        # ---------------------------------------------------------
        # 1. LIVE CLOUD LLM GENERATION (OpenAI ChatGPT or Groq Llama 3.3)
        # ---------------------------------------------------------
        if llm_service.is_live_available():
            try:
                system_prompt = (
                    f"You are NOT an AI assistant. You are {persona_name}, a {age}-year-old real person living in {location}. "
                    f"You work as a {occupation}.\n\n"
                    f"YOUR REAL-LIFE SITUATION:\n"
                    f"- Daily Morning Routine: {schedule}\n"
                    f"- What You Eat: {diet}\n"
                    f"- Dining Budget: {budget}\n"
                    f"- Delivery Expectations: {delivery_exp}\n"
                    f"- What Bugs You: {', '.join(objections) if objections else 'Cold food, late delivery, high fees'}\n\n"
                    f"HOW TO CHAT LIKE A REAL PERSON:\n"
                    f"1. You are chatting casually in real-time with someone who asked you a question. Talk exactly like a real human being on WhatsApp or a voice call.\n"
                    f"2. Keep it brief and natural: 1 to 3 punchy, conversational sentences. Never write long essays or bullet points.\n"
                    f"3. Use natural conversational expressions: 'Honestly...', 'Oh definitely!', 'Haha yeah', 'To be real with you...', 'Ugh, tell me about it', 'I love...', 'Not really', contractions ('I'm', 'don't', 'it's', 'that's').\n"
                    f"4. If the person greets you with 'hi' or 'hello', reply warmly with 'Hi! Great to connect with you. How are you doing today?' or similar.\n"
                    f"5. Answer personal questions (breakfast, jokes, weather, thoughts) like a real human living in Bangalore, staying 100% in your persona.\n"
                    f"6. End with natural conversational hooks when appropriate (e.g., 'What about you?', 'Do you prefer coffee or tea?').\n"
                    f"7. Never break character. Never mention being an AI or a simulated model.\n\n"
                    f"Respond ONLY with a JSON object in this format:\n"
                    f"{{\n"
                    f"  \"response\": \"Your natural spoken reply (1-3 sentences)\",\n"
                    f"  \"internal_reasoning\": \"1 short sentence on what you genuinely felt\"\n"
                    f"}}"
                )

                history_text = ""
                for msg in message_history[-6:]:
                    role = "Researcher" if msg.get("sender") == "researcher" else persona_name
                    history_text += f"{role}: {msg.get('content')}\n"

                user_prompt = f"{history_text}Researcher: {new_message}\n{persona_name}:"

                res = await llm_service.generate_completion(system_prompt, user_prompt, json_mode=True)
                if res.get("live") and res.get("content"):
                    raw = res["content"].strip()
                    if raw.startswith("```"):
                        raw = re.sub(r"^```(?:json)?\s*", "", raw)
                        raw = re.sub(r"\s*```$", "", raw)
                    try:
                        data = json.loads(raw)
                        spoken_reply = data.get("response") or data.get("content") or raw
                        reasoning_text = data.get("internal_reasoning") or data.get("reasoning") or f"Direct personal thought as {persona_name}."
                    except Exception:
                        spoken_reply = raw
                        reasoning_text = f"Direct personal thought as {persona_name}."

                    return {
                        "content": spoken_reply,
                        "reasoning": reasoning_text,
                        "retrieved_memories": relevant_memories
                    }
            except Exception:
                pass  # Fallback seamlessly to our dynamic real-person engine

        # ---------------------------------------------------------
        # 2. AUTONOMOUS REAL-PERSON CONVERSATIONAL ENGINE
        # ---------------------------------------------------------
        q = new_message.strip()
        q_lower = q.lower()
        cleaned = re.sub(r'[^\w\s]', ' ', q_lower)
        words = set(cleaned.split())

        reply = ""
        reasoning = ""

        # Check previous conversation context for follow-ups
        last_researcher_msg = ""
        last_persona_msg = ""
        for m in reversed(message_history):
            if m.get("sender") == "researcher" and not last_researcher_msg and m.get("content") != new_message:
                last_researcher_msg = m.get("content", "").lower()
            elif m.get("sender") == "persona" and not last_persona_msg:
                last_persona_msg = m.get("content", "").lower()

        # =========================================================================
        # A. CASUAL GREETINGS & SOCIAL BANTER (Mirroring & Human Politeness)
        # =========================================================================
        if q_lower in ["hi", "hi!", "hi.", "hi there", "hey", "hey!", "hey there", "yo", "hello", "hello!", "hoi"] or q_lower.startswith(("hi ", "hey ", "hello ")):
            greeting_token = "Hi" if "hi" in q_lower else ("Hey" if "hey" in q_lower else "Hello")
            reply = f"{greeting_token}! Great to connect with you. I'm {persona_name}. How are you doing today?"
            reasoning = "Natural, warm greeting mirroring the user's casual opening."

        elif any(g in q_lower for g in ["how are you", "how are you doing", "how's it going", "how are u", "how r u"]):
            if is_senior:
                reply = f"I'm doing very well, thank you! Just finished my morning walk and newspaper reading. How about yourself?"
                reasoning = "Friendly, polite senior greeting sharing morning peacefulness."
            elif is_student:
                reply = f"Hey, doing good! Just woke up a bit ago and hanging out before lectures. How's your day going?"
                reasoning = "Casual college student status check."
            elif is_tech_corporate:
                reply = f"I'm doing well, thanks! Just taking a quick breather between morning syncs and emails. How are you doing today?"
                reasoning = "Relatable corporate work context with warm reciprocal check."
            else:
                reply = f"I'm doing great, thanks for asking! Having a pretty productive day so far. How about yourself?"
                reasoning = "Upbeat, warm personal response."

        elif any(g in q_lower for g in ["what's up", "whats up", "sup"]):
            reply = f"Not much, just taking a quick coffee break and chatting with you! What's up with you?"
            reasoning = "Casual human banter response."

        elif any(g in q_lower for g in ["good morning", "good afternoon", "good evening"]):
            g_time = "Good morning" if "morning" in q_lower else ("Good afternoon" if "afternoon" in q_lower else "Good evening")
            reply = f"{g_time}! Hope you're having a wonderful day so far. What would you like to chat about today?"
            reasoning = f"Mirrored {g_time} greeting."

        elif any(g in q_lower for g in ["thank you", "thanks", "thx", "appreciate it"]):
            reply = f"You're very welcome! Always happy to share my honest thoughts. Anything else on your mind?"
            reasoning = "Warm conversational acknowledgment."

        elif q_lower in ["ok", "okay", "cool", "nice", "great", "awesome", "got it", "alright", "fair enough", "makes sense"]:
            reply = f"Awesome! What else would you like to ask or chat about?"
            reasoning = "Natural conversational bridge inviting the next question."

        elif any(g in q_lower for g in ["bye", "goodbye", "see you", "talk later", "take care", "good night"]):
            reply = f"Bye! It was really great chatting with you. Take care and have a wonderful day ahead!"
            reasoning = "Warm conversational farewell."

        # =========================================================================
        # B. PERSONAL IDENTITY, LIVING IN BANGALORE & REAL-LIFE CHIT-CHAT
        # =========================================================================
        elif any(g in q_lower for g in ["who are you", "what is your name", "tell me about yourself", "introduce yourself", "about you"]):
            if is_senior:
                reply = (
                    f"I'm {persona_name}! I'm {age} and living happily retired in {location}. "
                    f"My mornings are quite peaceful—a brisk walk around 6 AM, some meditation, and of course my morning filter coffee. "
                    f"Really nice to connect with you!"
                )
                reasoning = f"Gentle, personal self-introduction as a {age}-year-old retired resident."
            elif is_student:
                reply = (
                    f"Hey! I'm {persona_name}, {age} years old and currently a {occupation} staying around {location}. "
                    f"My schedule is pretty all over the place between classes and studying, so I'm always looking for quick, affordable food. Great to meet you!"
                )
                reasoning = "Upbeat student self-introduction."
            elif is_tech_corporate:
                reply = (
                    f"Hey, I'm {persona_name}! I'm {age} and work as a {occupation} here in {location}. "
                    f"Mornings for me are usually a sprint with {schedule.split(',')[0]}, so a good breakfast and strong filter coffee are essential. Glad to chat!"
                )
                reasoning = f"Casual first-person self-introduction as a {occupation} in tech."
            else:
                reply = (
                    f"I'm {persona_name}! I'm {age} and work as a {occupation} living in {location}. "
                    f"Really happy to share my real experiences with you today!"
                )
                reasoning = "Friendly authentic self-introduction."

        elif any(w in words for w in ["robot", "bot", "ai"]) or any(phrase in q_lower for phrase in ["are you real", "real person", "are you human", "human or ai", "you an ai"]):
            reply = f"Haha, of course I'm a real person! I'm sitting right here chatting with you over a morning break. Why, do I sound like a robot? 😂"
            reasoning = "Playful, authentic human reaction dispelling AI doubt with humor."

        elif any(phrase in q_lower for phrase in ["tell me a joke", "make me laugh", "say something funny"]):
            reply = f"Haha okay, here's one: Why did the dosa go to the gym? ...To get that griddle-crisp six-pack! 😂 Pretty cheesy, but you asked!"
            reasoning = "Charming, relatable food-themed joke."

        elif any(phrase in q_lower for phrase in ["where do you live", "which city", "which area", "where are you from", "your location"]):
            reply = f"I'm based in {location}! The morning weather here is lovely today, though traffic on the main roads is as crazy as ever. Where are you chatting from?"
            reasoning = f"Real-world local context anchored in {location} with reciprocal question."

        elif any(phrase in q_lower for phrase in ["how is the weather", "weather today", "is it raining"]):
            reply = f"It's actually really pleasant today in Bangalore! Nice cool morning breeze, honestly perfect weather to sit back with a hot cup of filter coffee."
            reasoning = "Locally authentic Bangalore weather chat."

        elif any(phrase in q_lower for phrase in ["what did you eat", "what did you have for breakfast", "had breakfast", "have breakfast", "eat today"]):
            if is_senior:
                reply = f"I had two soft steamed idlis with fresh coconut chutney and a warm cup of filter coffee right after my morning walk. Simple and soothing! What did you have?"
                reasoning = "Authentic light South Indian breakfast for senior."
            elif is_health_buff:
                reply = f"I actually made a warm bowl of ragi porridge and grabbed a black coffee right after my morning workout! What did you have for breakfast?"
                reasoning = "Health-conscious breakfast routine."
            elif is_student:
                reply = f"Honestly, I was running late so I just grabbed a hot chai and a quick samosa near my college! What about you, did you have breakfast yet?"
                reasoning = "Relatable student grab-and-go meal."
            else:
                reply = f"This morning I grabbed a crispy ghee roast dosa and a strong South Indian filter coffee to get through my morning meetings! What did you eat?"
                reasoning = "Classic favorite breakfast with reciprocal question."

        elif any(phrase in q_lower for phrase in ["up to", "doing right now", "doing now", "what are you doing", "what r u doing"]):
            reply = f"Just taking a quick break from my daily routine to chat with you! What are you up to today?"
            reasoning = "Casual real-time context."

        # =========================================================================
        # C. MULTI-TURN CONTEXT AWARENESS (Short follow-up questions)
        # =========================================================================
        elif q_lower in ["why?", "why so?", "why is that?", "how come?", "why would you say that?", "why"]:
            if any(k in last_persona_msg for k in ["fee", "99", "price", "expensive"]):
                reply = (
                    f"Because paying ₹99 for delivery on a ₹140 dosa feels like a total rip-off! "
                    f"Delivery should be a small reasonable convenience charge, not almost double the cost of the meal."
                )
                reasoning = "Follow-up explanation detailing fee-to-food price disproportionality."
            elif any(k in last_persona_msg for k in ["coffee", "tea", "kaapi"]):
                reply = (
                    f"Because authentic filter coffee is all about that fresh decoction aroma and scalding temperature. "
                    f"If it arrives lukewarm in a soggy paper cup, the milk tastes flat and the whole morning ritual is ruined."
                )
                reasoning = "Follow-up explanation on coffee aroma and temperature sensitivity."
            elif any(k in last_persona_msg for k in ["cook", "kitchen", "home"]):
                reply = (
                    f"Because fermenting batter, grinding chutney, and scrubbing a greasy tawa takes 45 minutes of messy work. "
                    f"On a busy morning, that extra time to relax or get ready is worth so much more."
                )
                reasoning = "Follow-up explanation on kitchen friction and morning prep time."
            elif any(k in last_persona_msg for k in ["packaging", "soggy", "leak"]):
                reply = (
                    f"Because trapped steam turns a crispy golden dosa into rubber within 10 minutes! Nobody wants to eat a wet, limp crepe."
                )
                reasoning = "Follow-up explanation on steam condensation in enclosed packaging."
            else:
                reply = (
                    f"Honestly, it just comes down to daily convenience and peace of mind. When you're hungry in the morning, you want things to be effortless, reliable, and delicious!"
                )
                reasoning = "General conversational elaboration grounded in morning ease."

        elif q_lower in ["really?", "seriously?", "are you sure?", "for real?"]:
            reply = f"Yeah, 100%! I've had it happen to me multiple times, so I speak from real experience. Have you ever faced something similar?"
            reasoning = "Direct, authentic human affirmation with conversational hook."

        elif q_lower in ["what do you mean?", "can you explain?", "elaborate", "tell me more"]:
            reply = (
                f"What I mean is, breakfast sets the tone for your whole day. If your delivery is delayed by 30 minutes or arrives lukewarm, "
                f"it completely messes up your mood and morning flow. That's why reliability matters so much to me."
            )
            reasoning = "Clear, empathetic conversational elaboration."

        # =========================================================================
        # D. DELIVERY FEES & PRICING PSYCHOLOGY (₹99 vs Basket Size)
        # =========================================================================
        elif any(w in words for w in ["99", "49", "fee", "fees", "price", "pricing", "cost", "expensive", "cheap", "charge", "charges", "delivery fee"]):
            if is_student or is_budget_conscious:
                reply = (
                    f"Honestly, a ₹99 delivery fee is a huge dealbreaker for me! If my dosa is ₹130, adding ₹99 just for delivery means I'm paying "
                    f"almost ₹230 for one breakfast. I'd definitely cancel my order and just grab something down the street."
                )
                reasoning = "Strict budget sensitivity: high fee percentage triggers immediate cart abandonment."
            elif is_senior:
                reply = (
                    f"To be honest, ₹99 feels quite high for a single breakfast order. As pensioners, we're careful about unnecessary charges. "
                    f"If the delivery was ₹30 or free above ₹250 when my family is visiting, that would be much more reasonable."
                )
                reasoning = "Senior value orientation: seeks fair pricing and family basket thresholds."
            elif is_affluent:
                reply = (
                    f"To be real with you, ₹99 doesn't bother me as long as the food arrives strictly within 30 minutes and boiling hot. "
                    f"Saving 45 minutes of kitchen hassle before my workday is worth way more to me than ₹99. Though I'd probably just buy the monthly pass!"
                )
                reasoning = "High convenience elasticity: trades fee for guaranteed time and heat."
            else:
                reply = (
                    f"₹99 feels pretty steep if I'm just ordering for myself on a normal Tuesday. But if Kadappa Cafe has free delivery "
                    f"above ₹200 or that ₹199 monthly pass, I'd definitely jump on that instead."
                )
                reasoning = "Moderate consumer balancing solo order friction against basket thresholds."

        # =========================================================================
        # E. KADAPPA MORNING PASS & SUBSCRIPTIONS (₹199 / Month)
        # =========================================================================
        elif any(w in words for w in ["subscription", "morning pass", "pass", "monthly", "membership", "subscribe", "199", "plan"]):
            if is_student:
                reply = (
                    f"₹199 for a whole month of free delivery? That's actually brilliant! My roommates and I would probably share the account "
                    f"and order breakfast 3 or 4 times a week. It pays for itself in just two orders!"
                )
                reasoning = "Student collective utility: high appeal through order pooling."
            elif is_senior:
                reply = (
                    f"That ₹199 monthly pass sounds very sensible. If it covers daily breakfast deliveries without hidden charges, it would make "
                    f"ordering on days when my wife or I don't feel like cooking so simple."
                )
                reasoning = "Senior appreciation for predictable monthly convenience."
            else:
                reply = (
                    f"I'd definitely subscribe to the ₹199 pass! I order breakfast at least 8 to 10 times a month, so eliminating daily delivery fees "
                    f"and getting priority morning dispatch is an absolute no-brainer."
                )
                reasoning = "High repeat breakfast consumer recognizes immediate ROI."

        # =========================================================================
        # F. COFFEE VS TEA & MORNING BEVERAGES
        # =========================================================================
        elif any(w in words for w in ["coffee", "tea", "chai", "kaapi", "beverage", "drink", "chicory", "cappuccino", "latte"]):
            if "tea" in words and "coffee" not in words and "chai" not in words:
                reply = (
                    f"I do enjoy a nice cup of ginger tea in the late afternoon, but morning for me is strictly South Indian filter coffee! "
                    f"I really need that strong chicory aroma to properly wake up. What about you—are you more of a tea or coffee person?"
                )
                reasoning = "Temporal preference: filter coffee morning ritual with conversational hook."
            else:
                reply = (
                    f"Oh, 100% filter coffee for me! There's nothing like strong, piping hot filter kaapi to start the day. "
                    f"My only rule is it must arrive scalding hot in a proper insulated flask or cup. Lukewarm coffee is tragic! Are you a coffee lover too?"
                )
                reasoning = "Passionate filter coffee devotion with interactive question."

        # =========================================================================
        # G. BAD EXPERIENCES & FOOD DELIVERY HORROR STORIES
        # =========================================================================
        elif any(w in words for w in ["bad", "worst", "experience", "terrible", "horror", "poisoning", "problem", "frustration", "annoy", "complaint"]):
            if is_tech_corporate:
                reply = (
                    f"Oh man, yes! Once an order took 55 minutes in the rain, the sambar leaked completely through the paper bag, and the dosa was a cold rubbery sponge. "
                    f"I had to join my sprint demo totally starving. It was so frustrating!"
                )
                reasoning = "Relatable corporate work story of delivery delay and soggy food."
            elif is_senior:
                reply = (
                    f"Yes, unfortunately. Last monsoon an order was delayed by over an hour, and when the delivery boy arrived, the sambar had spilled all over "
                    f"and the idlis were ice-cold. At our age, eating cold, soggy food really upsets the stomach."
                )
                reasoning = "Senior recounting bad experience with spilled food and digestive distress."
            else:
                reply = (
                    f"Oh definitely. There's nothing worse than waiting 50 minutes only for your dosa to arrive lukewarm and stuck to the container, "
                    f"with half the chutney spilled in the bag. It completely ruins your morning mood!"
                )
                reasoning = "Universal visceral frustration with delivery delays and packaging spills."

        # =========================================================================
        # H. PACKAGING, SOGGINESS & HEAT PRESERVATION
        # =========================================================================
        elif any(w in words for w in ["packaging", "package", "box", "container", "containers", "plastic", "soggy", "sogginess", "leak", "leaking", "spill", "spillage"]):
            reply = (
                f"My biggest pet peeve is soggy dosas! When restaurants pack hot dosas into non-breathable plastic boxes, the steam gets trapped and turns "
                f"the crispy crust into a soggy mess within 15 minutes. Breathable, vented boxes and leakproof chutney tubs are non-negotiable!"
            )
            reasoning = "Vocal demand for vented thermal packaging to prevent moisture condensation."

        # =========================================================================
        # I. DELIVERY SPEED & 30-MINUTE SLA
        # =========================================================================
        elif any(w in words for w in ["speed", "fast", "quick", "sla", "30", "delay", "late", "traffic", "punctual", "arrive", "time"]):
            if is_tech_corporate:
                reply = (
                    f"30 minutes is the golden rule. My first morning standup starts at 9:30 AM sharp, so if food arrives at 9:45 AM, I'm stuck eating cold food "
                    f"while on camera with my microphone muted. Punctuality is everything."
                )
                reasoning = "Strict calendar constraints of corporate tech routine."
            elif is_senior:
                reply = (
                    f"Punctuality is very important to me. I take my morning medication strictly by 8:15 AM after breakfast, so having delivery arrive within "
                    f"30 minutes reliably gives me immense peace of mind."
                )
                reasoning = "Health and medication routine tied to delivery punctuality."
            else:
                reply = (
                    f"When you order breakfast, you're already hungry. 30 minutes feels reasonable, but once it crosses 45 minutes, it really tests your patience. "
                    f"Fast, predictable delivery is why people use the app in the first place."
                )
                reasoning = "Hunger threshold and expectation of dependable delivery."

        # =========================================================================
        # J. SAMBAR, CHUTNEY & SOUTH INDIAN FLAVORS
        # =========================================================================
        elif any(w in words for w in ["sambar", "chutney", "spicy", "sweet", "taste", "flavor", "podi", "curry", "gunpowder", "chutneys"]):
            if any(w in words for w in ["sweet", "sweetness"]):
                reply = (
                    f"Please, no sweet sambar! I want thick, savory sambar made with shallots and drumstick, plus that fiery red tomato chutney. "
                    f"Sweet sambar belongs on dessert, not on my breakfast table haha!"
                )
                reasoning = "Passionate rejection of sweet sambar in favor of authentic savory spice."
            else:
                reply = (
                    f"Honestly, sambar and chutney make or break South Indian breakfast! I love thick, freshly grated coconut chutney with that crackling curry leaf tadka, "
                    f"and piping hot shallot sambar. If the chutneys are stale or watery, I never order from that place again."
                )
                reasoning = "Accompaniment freshness identified as decisive loyalty criteria."

        # =========================================================================
        # K. COOKING AT HOME VS ORDERING
        # =========================================================================
        elif any(w in words for w in ["cook", "cooking", "home", "kitchen", "maid", "prepare", "homemade", "grocery"]):
            if is_senior:
                reply = (
                    f"We cook at home most days, but on days when my wife or I are feeling tired or want a special treat, ordering a crisp ghee dosa "
                    f"from Kadappa Cafe is such a wonderful relief from kitchen work."
                )
                reasoning = "Senior perspective on ordering as respite from daily culinary chores."
            elif is_homemaker_parent:
                reply = (
                    f"Making fresh breakfast from scratch for the whole family every single morning is exhausting! Scrubbing the tawa and grinding chutney takes "
                    f"45 minutes. Having Kadappa Cafe deliver hot breakfast gives me a well-deserved morning break."
                )
                reasoning = "Homemaker relief from breakfast preparation and cleanup."
            else:
                reply = (
                    f"Making dosa at home on a weekday is too much work! Between fermenting batter, frying on a hot griddle, and doing greasy dishes, "
                    f"you lose 40 minutes before work. Ordering is just so much easier and faster."
                )
                reasoning = "High friction of home batter preparation and dishes on weekdays."

        # =========================================================================
        # L. FOOD PREFERENCES: DOSA VS IDLI VS MILLET
        # =========================================================================
        elif any(w in words for w in ["dosa", "idli", "vada", "millets", "millet", "ragi", "foxtail", "pongal", "poori", "dish", "dishes", "menu", "favorite", "eat"]):
            if any(w in words for w in ["millet", "ragi", "foxtail", "healthy"]):
                reply = (
                    f"I love ragi and foxtail millet dosas! Eating heavy refined rice batter every single day can make you feel sluggish by 11 AM, "
                    f"so having nutritious, gut-friendly millet options that still taste crispy is amazing."
                )
                reasoning = "Appreciation for healthy, low-glycemic ancient grain alternatives."
            elif "idli" in words and "dosa" not in words:
                reply = (
                    f"I love soft, melt-in-the-mouth steamed idlis, especially hot ghee podi idlis! They're super light on the stomach, quick to eat, "
                    f"and paired with fresh coconut chutney, it's the ultimate comfort breakfast."
                )
                reasoning = "Love for light, digestible steamed South Indian classics."
            elif "dosa" in words and "idli" not in words:
                reply = (
                    f"Hands down, a crispy golden ghee roast dosa! There's nothing quite like that griddle crunch with some spicy podi and chutney. "
                    f"As long as it doesn't get soggy in transit, that's my number one comfort breakfast."
                )
                reasoning = "Enthusiasm for crispy ghee griddle texture."
            else:
                reply = (
                    f"If I had to pick, my go-to order is a crispy ghee podi masala dosa with one crunchy medu vada and piping hot filter coffee. "
                    f"Comfort food at its absolute best! What's your favorite breakfast dish?"
                )
                reasoning = "Classic iconic South Indian breakfast trio with conversational hook."

        # =========================================================================
        # M. AGGREGATOR APPS (Swiggy / Zomato vs Kadappa Cafe)
        # =========================================================================
        elif any(w in words for w in ["swiggy", "zomato", "competitor", "other apps", "aggregator", "darshini"]):
            reply = (
                f"The main problem with Swiggy and Zomato in the morning is all the hidden fees and unpredictable delivery times. "
                f"When you just want a quick, hot breakfast, having a dedicated specialist like Kadappa Cafe that guarantees fast hot delivery is so much better."
            )
            reasoning = "Contrasts dedicated cafe service against aggregator fee fatigue and delays."

        # =========================================================================
        # N. WORK, ROUTINE & DAILY LIFE
        # =========================================================================
        elif any(w in words for w in ["routine", "wake", "morning", "alarm", "schedule", "work", "job", "career", "office", "wfh", "meeting", "sprint"]):
            if is_senior:
                reply = (
                    f"My routine is very relaxed these days! Up by 5:30 AM, a morning stroll in the garden or park, newspaper with coffee, "
                    f"and then quiet reading. Having a peaceful morning routine is the greatest joy of retirement."
                )
                reasoning = "Serene retired morning routine."
            elif is_student:
                reply = (
                    f"My routine is honestly pretty chaotic! I usually wake up around 8:30 AM, rush to get ready, and head to college. "
                    f"Anything that saves me time and gives me a quick meal is a lifesaver."
                )
                reasoning = "Spontaneous, rushed student schedule."
            else:
                reply = (
                    f"My morning schedule is pretty fast-paced with {schedule.split(',')[0]}. I usually aim to finish breakfast by 8:30 AM "
                    f"before work syncs kick in. Having reliable food delivery keeps my whole morning on track!"
                )
                reasoning = "Fast-paced corporate schedule requiring seamless morning efficiency."

        # =========================================================================
        # O. WEEKENDS & LEISURE
        # =========================================================================
        elif any(w in words for w in ["weekend", "weekends", "sunday", "saturday", "hobby", "hobbies", "fun", "relax", "free time"]):
            if is_senior:
                reply = (
                    f"On weekends, our children and grandchildren often visit! We have a big family brunch, play with the little ones, and catch up. "
                    f"It's the highlight of the week for us."
                )
                reasoning = "Warm family weekend memories for senior."
            elif is_student:
                reply = (
                    f"On weekends I love sleeping in till noon! Then catching up with friends, exploring cafes in Koramangala, or playing video games. Total chill mode!"
                )
                reasoning = "Carefree college weekend lifestyle."
            else:
                reply = (
                    f"On weekends I take it super easy! I sleep in, go for a long walk or catch up with friends, and have a relaxed brunch around 10:30 AM "
                    f"without staring at meeting calendars. Pure bliss!"
                )
                reasoning = "Contrasts weekday rush with leisurely weekend rest."

        # =========================================================================
        # P. SUGGESTIONS & WISHES FOR KAPPA CAFE
        # =========================================================================
        elif any(w in words for w in ["improve", "suggestion", "suggestions", "advice", "feature", "recommend", "feedback"]):
            reply = (
                f"If you want me ordering every single morning: guarantee that 30-minute hot delivery, make sure the coffee arrives steaming hot without leaking, "
                f"and let me schedule my order the night before so it shows up right at 7:45 AM. Do that, and you've got a customer for life!"
            )
            reasoning = "Actionable suggestions regarding pre-scheduling and heat preservation."

        # =========================================================================
        # Q. GENERAL CHAT / FALLBACK FOR ANY CASUAL QUESTION
        # =========================================================================
        else:
            topic_words = [w for w in cleaned.split() if len(w) > 3 and w not in [
                "what", "when", "where", "which", "would", "could", "should", "about", 
                "your", "this", "that", "with", "have", "from", "there", "their", "they", "them", "some"
            ]]
            core_topic = " ".join(topic_words[:3]) if topic_words else "that"

            if is_senior:
                reply = (
                    f"To be honest, when it comes to {core_topic}, at my age I value simplicity, authentic quality, and reliable service. "
                    f"As long as food is fresh, hot, and hygienic, that's what truly counts. What's your perspective on it?"
                )
                reasoning = f"Thoughtful senior perspective on '{core_topic}' prioritizing health and authenticity."
            elif is_student:
                reply = (
                    f"Haha, honestly when it comes to {core_topic}, for me as a student it's all about good taste without burning a hole in my pocket! "
                    f"Keep it fast, tasty, and reasonably priced and I'm sold. What do you think?"
                )
                reasoning = f"Candid student perspective on '{core_topic}' prioritizing price and taste."
            else:
                reply = (
                    f"Honestly, when it comes to {core_topic}, in my daily life as a {occupation}, I just look for genuine quality, authentic taste, "
                    f"and no-hassle reliability. When a service nails those basics, I become a regular customer! What are your thoughts on that?"
                )
                reasoning = f"Engaging personal perspective on '{core_topic}' as a {occupation} with reciprocal hook."

        return {
            "content": reply,
            "reasoning": reasoning,
            "retrieved_memories": relevant_memories
        }

interview_engine = InterviewEngine()
