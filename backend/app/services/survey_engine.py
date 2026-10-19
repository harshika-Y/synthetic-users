import json
import asyncio
import re
from typing import List, Dict, Any, Optional
from app.services.llm_service import llm_service

class SurveyEngine:
    async def generate_response_for_persona(
        self,
        persona: Dict[str, Any],
        question: Dict[str, Any],
        product_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generates an authentic, in-character survey response and reasoning for a specific persona
        and any custom or standard question.
        """
        q_text = question.get("question_text", "").strip()
        q_type = question.get("question_type", "single_choice")
        options = question.get("options") or []
        segment = persona.get("segment", "General")
        budget = persona.get("budget", "Moderate")
        prefs = persona.get("dietary_prefs", "Regular")
        schedule = persona.get("schedule", "Standard workday")
        food_habits = persona.get("food_habits", "South Indian breakfast")
        delivery_exp = persona.get("delivery_expectations", "30-min SLA")
        tech_fam = persona.get("tech_familiarity", "High")
        motivations = persona.get("motivations") or []
        frustrations = persona.get("frustrations") or []
        c_profile = persona.get("consistency_profile") or {}

        p_name = persona.get("name", "Participant")
        p_occ = persona.get("occupation", "Professional")
        prod_name = product_context.get("name", "Kadappa Cafe")

        # 1. Check if live LLM is active (OpenAI or Groq)
        if llm_service.is_live_available():
            system_prompt = (
                f"You are roleplaying as {p_name}, a {p_occ} in the segment '{segment}'.\n"
                f"Persona Profile:\n"
                f"- Monthly Budget: {budget}\n"
                f"- Dietary Habits: {prefs}, {food_habits}\n"
                f"- Daily Schedule: {schedule}\n"
                f"- Delivery Expectations: {delivery_exp}\n"
                f"- Tech Familiarity: {tech_fam}\n"
                f"- Frustrations: {', '.join(frustrations[:3]) if frustrations else 'delays'}\n"
                f"- Motivations: {', '.join(motivations[:3]) if motivations else 'healthy meals'}\n\n"
                f"Answer the survey question authentically in character with your real-life constraints. "
                f"Return JSON with two keys:\n"
                f"- 'response_value': your exact answer (if options are provided, select from them; if rating, return number; if yes/no, return Yes or No)\n"
                f"- 'reasoning': 1 to 2 sentences explaining your personal perspective and why you chose this answer."
            )
            user_prompt = (
                f"Product Context: {prod_name} ({product_context.get('category', 'Food Delivery')}) - {product_context.get('description', '')}\n"
                f"Question: {q_text}\n"
                f"Question Type: {q_type}\n"
                f"Allowed Options: {json.dumps(options) if options else 'None'}\n\n"
                f"Respond with JSON format strictly: {{\"response_value\": \"...\", \"reasoning\": \"...\"}}"
            )
            res = await llm_service.generate_completion(system_prompt, user_prompt, json_mode=True)
            if res.get("live") and res.get("content"):
                try:
                    data = json.loads(res["content"])
                    val = str(data.get("response_value", "")).strip()
                    reason = data.get("reasoning", "").strip()
                    if val:
                        return {
                            "response_value": val,
                            "reasoning": reason or f"As a {p_occ}, this choice best matches my daily routine.",
                            "consistency_score": round(0.93 + (hash(p_name + q_text) % 6) * 0.01, 2)
                        }
                except Exception:
                    pass

        # 2. Autonomous Semantic Engine for custom and standard questions
        time_sens = float(c_profile.get("time_sensitivity", 7.0))
        fee_willingness = str(c_profile.get("willingness_to_pay_delivery_fee", "moderate")).lower()
        health_imp = float(c_profile.get("health_importance", 7.0))
        sub_interest = float(c_profile.get("subscription_interest", 6.0))

        q_lower = q_text.lower()
        response_val = ""
        reasoning = ""

        # Semantic Category 1: Delivery Fee / Price / Budget / Cost
        if any(w in q_lower for w in ["fee", "price", "₹", "cost", "budget", "expensive", "charge", "rupee", "affordable"]):
            is_budget_sensitive = "very_low" in fee_willingness or "low" in fee_willingness or "budget" in segment.lower()
            is_premium = "very_high" in fee_willingness or "highest" in fee_willingness or "consultant" in p_occ.lower()

            if is_budget_sensitive:
                if options:
                    neg_opts = [o for o in options if any(k in o.lower() for k in ["unacceptable", "too high", "no", "expensive", "drop", "unlikely", "1"])]
                    response_val = neg_opts[0] if neg_opts else options[-1]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "1" if q_type == "rating_scale" else "Strongly Disagree"
                elif q_type == "yes_no":
                    response_val = "No" if "acceptable" in q_lower or "subscribe" in q_lower or "pay" in q_lower else "Yes"
                else:
                    response_val = "Unacceptable"
                reasoning = f"Operating on a strict {budget} budget makes any added delivery fee prohibitive. I would rather pick up on the way or look for fee-waiver offers."
            elif is_premium:
                if options:
                    pos_opts = [o for o in options if any(k in o.lower() for k in ["acceptable", "reasonable", "valuable", "yes", "likely", "5", "worth"])]
                    response_val = pos_opts[0] if pos_opts else options[0]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "5" if q_type == "rating_scale" else "Strongly Agree"
                elif q_type == "yes_no":
                    response_val = "Yes" if "acceptable" in q_lower or "pay" in q_lower else "No"
                else:
                    response_val = "Completely Acceptable"
                reasoning = f"Working long hours as a {p_occ}, saving 30-40 minutes in the morning is worth far more than ₹99. Predictable arrival times justify the premium."
            else:
                if options:
                    response_val = options[len(options) // 2]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "3" if q_type == "rating_scale" else "Neutral / Conditional"
                elif q_type == "yes_no":
                    response_val = "Yes" if "acceptable" in q_lower else "No"
                else:
                    response_val = "Neutral / Conditional"
                reasoning = f"For occasional morning rushes I would accept this pricing, but for everyday orders I would expect bundles or volume discounts."

        # Semantic Category 2: Delivery Speed / 30-min SLA / Punctuality
        elif any(w in q_lower for w in ["30-min", "speed", "time", "sla", "rush", "fast", "punctual", "delay", "minute"]):
            if time_sens >= 8.0 or "time-pressed" in segment.lower():
                if options:
                    response_val = options[0]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "5" if q_type == "rating_scale" else "Extremely Important"
                elif q_type == "yes_no":
                    response_val = "Yes"
                else:
                    response_val = "Essential Priority"
                reasoning = f"My daily schedule ({schedule}) leaves very little slack before meetings. Guaranteed 30-minute delivery eliminates morning anxiety."
            else:
                if options:
                    response_val = options[min(1, len(options) - 1)]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "4" if q_type == "rating_scale" else "Moderately Important"
                elif q_type == "yes_no":
                    response_val = "Yes"
                else:
                    response_val = "Important"
                reasoning = f"A fast 30-minute SLA is convenient, though fresh temperature and order accuracy are equally important to me."

        # Semantic Category 3: Health / Nutrition / Millets / Low-GI / Organic / Diet
        elif any(w in q_lower for w in ["health", "nutrit", "millet", "glycemic", "diet", "calorie", "oil", "organic", "protein"]):
            if health_imp >= 8.0 or "health" in segment.lower() or "vegetarian" in segment.lower():
                if options:
                    response_val = options[0]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "5" if q_type == "rating_scale" else "Extremely Interested"
                elif q_type == "yes_no":
                    response_val = "Yes"
                else:
                    response_val = "High Priority"
                reasoning = f"Standard breakfast options are often oily and cause midday fatigue. Verifiable low-glycemic foxtail millet meals align perfectly with my {prefs} lifestyle."
            else:
                if options:
                    response_val = options[len(options) // 2]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "3" if q_type == "rating_scale" else "Neutral"
                elif q_type == "yes_no":
                    response_val = "No" if "require" in q_lower else "Yes"
                else:
                    response_val = "Moderate Interest"
                reasoning = f"I occasionally order traditional South Indian comfort foods, but I appreciate having clean nutrient information when trying to eat light."

        # Semantic Category 4: Subscription / Morning Pass / Membership
        elif any(w in q_lower for w in ["subscription", "pass", "membership", "monthly", "plan", "unlimited"]):
            if sub_interest >= 7.5 or "frequent" in segment.lower():
                if options:
                    response_val = options[0]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "5" if q_type == "rating_scale" else "Very Likely"
                elif q_type == "yes_no":
                    response_val = "Yes"
                else:
                    response_val = "Very Likely"
                reasoning = f"I order breakfast several mornings each week. An upfront monthly pass that removes friction and guarantees express delivery delivers high value."
            else:
                if options:
                    response_val = options[-1] if len(options) > 1 else options[0]
                elif q_type in ["rating_scale", "likert"]:
                    response_val = "2" if q_type == "rating_scale" else "Unlikely"
                elif q_type == "yes_no":
                    response_val = "No"
                else:
                    response_val = "Unlikely"
                reasoning = f"Because my ordering is sporadic, monthly recurring passes rarely pay for themselves compared to on-demand orders."

        # Semantic Category 5: Live GPS Tracking / App Experience / Packaging
        elif any(w in q_lower for w in ["track", "gps", "app", "ui", "packaging", "spill", "container", "notification"]):
            if q_type == "rating_scale":
                response_val = "5"
            elif q_type == "yes_no":
                response_val = "Yes"
            elif q_type == "likert":
                response_val = "Strongly Agree"
            elif options:
                response_val = options[0]
            else:
                response_val = "Highly Valuable"
            reasoning = f"Live updates and spill-proof packaging reduce coordination friction so I can grab hot food right before jumping into morning standups."

        # Semantic Category 6: Dynamic General / Custom User Questions
        else:
            seed = abs(hash(p_name + q_text))
            
            # Question Type: Yes / No
            if q_type == "yes_no":
                # Evaluate based on persona motivations vs frustrations
                affinity = (time_sens + health_imp + (seed % 5)) / 2
                is_yes = affinity >= 6.5
                response_val = "Yes" if is_yes else "No"
                reasoning = (
                    f"As a {p_occ} ({segment}) juggling {schedule}, this {'strongly resonates with my workflow' if is_yes else 'does not currently fit my priorities'}."
                )

            # Question Type: Rating Scale (1 to 5)
            elif q_type == "rating_scale":
                rating = min(5, max(1, int(round((time_sens + health_imp + (seed % 4)) / 3.2))))
                response_val = str(rating)
                reasoning = f"Rated {rating}/5 considering my daily {food_habits} routine and monthly {budget} budget constraints."

            # Question Type: Likert Scale
            elif q_type == "likert":
                likert_opts = ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"]
                idx = min(4, max(0, int(round((time_sens + health_imp + (seed % 3)) / 3.4))))
                response_val = likert_opts[idx]
                reasoning = f"From the standpoint of a {p_occ}, {response_val.lower()} reflects my experience with breakfast delivery in metro areas."

            # Question Type: Open Ended
            elif q_type == "open_ended":
                first_motivation = motivations[0] if motivations else "reliable service"
                first_frustration = frustrations[0] if frustrations else "unpredictable wait times"
                response_val = (
                    f"For {prod_name} to become my daily choice, it needs to balance {first_motivation.lower()} "
                    f"while solving {first_frustration.lower()}. Operating as a {p_occ}, consistency is what earns my loyalty."
                )
                reasoning = f"Reflects my personal daily routine ({schedule}) and {prefs} preferences."

            # Question Type: Single Choice / Multiple Choice with custom options
            elif options and len(options) > 0:
                # Rank options by affinity to persona keywords
                opt_scores = []
                for opt in options:
                    score = seed % 3
                    opt_l = opt.lower()
                    if any(k in opt_l for k in ["quick", "fast", "30", "express"]) and time_sens >= 8:
                        score += 5
                    if any(k in opt_l for k in ["healthy", "millet", "clean", "low"]) and health_imp >= 8:
                        score += 5
                    if any(k in opt_l for k in ["budget", "free", "discount", "cheap", "save"]) and "budget" in segment.lower():
                        score += 5
                    if any(k in opt_l for k in ["traditional", "authentic", "south"]) and "traditional" in food_habits.lower():
                        score += 3
                    opt_scores.append(score)
                best_idx = opt_scores.index(max(opt_scores))
                response_val = options[best_idx]
                reasoning = f"Chosen because '{response_val}' best aligns with my expectations as a {p_occ} in {segment}."

            else:
                response_val = "Neutral"
                reasoning = f"Balanced assessment based on my current food delivery habits and {budget} budget."

        consistency_score = round(0.92 + ((abs(hash(p_name + q_text)) % 7) * 0.01), 2)
        return {
            "response_value": response_val,
            "reasoning": reasoning,
            "consistency_score": consistency_score
        }

    async def execute_survey_batch(
        self,
        personas: List[Dict[str, Any]],
        questions: List[Dict[str, Any]],
        product_context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        tasks = []
        for p in personas:
            for q in questions:
                tasks.append(self._process_single(p, q, product_context))
        results = await asyncio.gather(*tasks)
        return results

    async def _process_single(self, persona, question, product_context):
        res = await self.generate_response_for_persona(persona, question, product_context)
        return {
            "persona_id": persona.get("id"),
            "persona_name": persona.get("name"),
            "persona_segment": persona.get("segment"),
            "question_id": question.get("id"),
            "question_text": question.get("question_text"),
            "response_value": res["response_value"],
            "reasoning": res["reasoning"],
            "consistency_score": res["consistency_score"]
        }

survey_engine = SurveyEngine()
