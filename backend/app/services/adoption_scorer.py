from typing import List, Dict, Any

class AdoptionScorer:
    """
    Transparent, explainable adoption scoring engine evaluating persona compatibility across
    5 key product pillars: Speed (25%), Healthy Options (20%), Subscription Appeal (20%),
    Tracking (15%), and Delivery Fee Acceptability (20%).
    """
    WEIGHTS = {
        "speed": 0.25,
        "healthy_food": 0.20,
        "subscription": 0.20,
        "live_tracking": 0.15,
        "fee_tolerance": 0.20
    }

    def score_persona(self, persona: Dict[str, Any], responses: List[Dict[str, Any]]) -> Dict[str, Any]:
        c_profile = persona.get("consistency_profile") or {}
        time_sens = c_profile.get("time_sensitivity", 7.0) / 10.0 # 0 to 1
        health_imp = c_profile.get("health_importance", 7.0) / 10.0
        sub_int = c_profile.get("subscription_interest", 6.0) / 10.0
        fee_willingness = str(c_profile.get("willingness_to_pay_delivery_fee", "moderate")).lower()
        
        if "very_low" in fee_willingness:
            fee_score = 0.25
        elif "very_high" in fee_willingness or "highest" in fee_willingness:
            fee_score = 0.95
        elif "high" in fee_willingness:
            fee_score = 0.80
        else:
            fee_score = 0.55

        tracking_score = 0.90 # Almost universally valued in modern delivery

        # Compute weighted raw score (0 to 1)
        raw_score = (
            time_sens * self.WEIGHTS["speed"] +
            health_imp * self.WEIGHTS["healthy_food"] +
            sub_int * self.WEIGHTS["subscription"] +
            tracking_score * self.WEIGHTS["live_tracking"] +
            fee_score * self.WEIGHTS["fee_tolerance"]
        )

        overall_score = round(raw_score * 100, 1)

        if overall_score >= 75:
            stated_intention = "High"
        elif overall_score >= 50:
            stated_intention = "Moderate"
        else:
            stated_intention = "Unlikely"

        drivers = []
        barriers = []

        if time_sens >= 0.8:
            drivers.append("30-Minute Guaranteed Delivery")
        if health_imp >= 0.8:
            drivers.append("Healthy Food Section & Macro Tracking")
        if sub_int >= 0.8:
            drivers.append("Subscription Tier with Waived Delivery")
        if tracking_score >= 0.8:
            drivers.append("Real-Time GPS Order Tracking")

        if fee_score <= 0.4:
            barriers.append("₹99 Standalone Delivery Fee on Small Orders")
        if "vegetarian" in persona.get("segment", "").lower():
            barriers.append("Cross-Contamination Concerns in Kitchen Partner Network")
        if sub_int < 0.5:
            barriers.append("Low Ordering Frequency Reduces Subscription ROI")

        if not drivers:
            drivers.append("Convenient Mobile App Ordering")
        if not barriers:
            barriers.append("Reliability of SLA During Rain or Heavy Traffic")

        feature_ratings = {
            "30_min_delivery": round(time_sens * 100),
            "healthy_food": round(health_imp * 100),
            "subscription": round(sub_int * 100),
            "live_tracking": round(tracking_score * 100),
            "fee_tolerance": round(fee_score * 100)
        }

        reasoning = (
            f"{persona.get('name')} shows {stated_intention.lower()} adoption potential ({overall_score}/100). "
            f"Key motivator is {drivers[0]} aligning with their {persona.get('occupation')} schedule. "
            f"Primary point of friction is {barriers[0]}."
        )

        return {
            "persona_id": persona.get("id"),
            "persona_name": persona.get("name"),
            "persona_segment": persona.get("segment"),
            "overall_score": overall_score,
            "stated_intention": stated_intention,
            "confidence": 0.92,
            "drivers": drivers,
            "barriers": barriers,
            "reasoning": reasoning,
            "feature_ratings": feature_ratings
        }

    def aggregate_segments(self, persona_scores: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        seg_groups = {}
        for s in persona_scores:
            seg = s.get("persona_segment", "General")
            if seg not in seg_groups:
                seg_groups[seg] = []
            seg_groups[seg].append(s)

        segments_summary = []
        for seg, items in seg_groups.items():
            scores = [i["overall_score"] for i in items]
            mean_score = round(sum(scores) / len(scores), 1)
            intents = {"High": 0, "Moderate": 0, "Unlikely": 0}
            for i in items:
                intents[i["stated_intention"]] = intents.get(i["stated_intention"], 0) + 1

            all_drivers = [d for i in items for d in i["drivers"]]
            all_barriers = [b for i in items for b in i["barriers"]]

            top_feature = max(set(all_drivers), key=all_drivers.count) if all_drivers else "30-Minute Delivery"
            main_objection = max(set(all_barriers), key=all_barriers.count) if all_barriers else "₹99 Delivery Fee"

            segments_summary.append({
                "segment": seg,
                "count": len(items),
                "mean_score": mean_score,
                "intent_breakdown": intents,
                "top_feature": top_feature,
                "main_objection": main_objection,
                "reasoning": f"{seg} demonstrates a mean adoption score of {mean_score}/100. Valuing {top_feature} while remaining sensitive to {main_objection}."
            })

        return segments_summary

adoption_scorer = AdoptionScorer()
