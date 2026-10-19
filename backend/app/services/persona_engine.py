import json
import uuid
import random
import re
from typing import List, Dict, Any, Optional
from app.services.llm_service import llm_service

PERSONA_ARCHETYPES = [
    {
        "name": "Arjun Sharma",
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        "age": 28,
        "occupation": "Senior Software Engineer",
        "segment": "Time-pressed corporate professional",
        "schedule": "9:30 AM – 8:00 PM, fast-paced sprints and late deployments",
        "budget": "Moderate-High (₹12,000/month on food orders)",
        "food_habits": "Orders lunch and dinner 4-5 times a week; prefers high-protein, clean bowls during weekdays",
        "dietary_prefs": "High-protein, low-carb, non-vegetarian",
        "delivery_expectations": "Strict 30-minute delivery. Delays ruin sprint schedules and meetings",
        "tech_familiarity": "Expert",
        "motivations": ["Save time during workdays", "High predictability in delivery time", "High-protein clean meals"],
        "frustrations": ["Delivery delays of 15+ minutes", "Cold food", "Apps with inaccurate ETA tracking"],
        "objections": ["₹99 delivery fee feels steep for a single meal unless bundled into a subscription", "Spillages"],
        "feature_preferences": ["30-minute delivery", "Live order tracking", "Subscription plan with zero delivery fee"],
        "communication_style": "Direct, analytical, concise, efficiency-focused",
        "behavioral_tendencies": ["Quick checkout", "Prefers subscription if break-even is 4-5 orders"],
        "assumptions": ["Assumes live tracking includes live GPS coordinates of rider"],
        "consistency_profile": {
            "willingness_to_pay_delivery_fee": "low_per_order_high_for_monthly_sub",
            "time_sensitivity": 9.5,
            "health_importance": 8.0,
            "subscription_interest": 9.0
        }
    },
    {
        "name": "Pooja Hegde",
        "avatar": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        "age": 25,
        "occupation": "Associate Marketing Specialist",
        "segment": "Budget-conscious office employee",
        "schedule": "10:00 AM – 6:30 PM, hybrid office 3 days a week",
        "budget": "Strict (₹4,500/month maximum on food delivery)",
        "food_habits": "Cooks on weekends, orders office lunch with teammates to split delivery fees",
        "dietary_prefs": "Vegetarian, street-style comfort food, pocket-friendly meals",
        "delivery_expectations": "Reasonable delivery (within 45 mins), but price matters much more than speed",
        "tech_familiarity": "High",
        "motivations": ["Affordable combo meals", "Splitting orders with colleagues", "Coupons and loyalty discounts"],
        "frustrations": ["Surge fees", "High minimum order values", "Unreasonable packaging charges"],
        "objections": ["₹99 delivery fee is an absolute dealbreaker for a ₹150 meal"],
        "feature_preferences": ["Affordable value combos", "Group ordering discount", "Low delivery fee tier"],
        "communication_style": "Warm, practical, cost-conscious, peer-oriented",
        "behavioral_tendencies": ["Abandons cart when final bill exceeds ₹220", "Always checks for active coupon codes"],
        "assumptions": ["Expects delivery fees to be under ₹40 or waived for small orders"],
        "consistency_profile": {
            "willingness_to_pay_delivery_fee": "very_low",
            "time_sensitivity": 5.0,
            "health_importance": 6.0,
            "subscription_interest": 4.0
        }
    },
    {
        "name": "Dr. Kavita Narayanan",
        "avatar": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        "age": 34,
        "occupation": "Clinical Research Lead & Nutrition Consultant",
        "segment": "Health-conscious working professional",
        "schedule": "8:00 AM – 6:00 PM hospital & lab rotations",
        "budget": "High (₹18,000/month on organic & curated meals)",
        "food_habits": "Meticulous about macro counts, zero refined oils, fresh salads and millets",
        "dietary_prefs": "Gluten-free, organic, plant-forward vegetarian",
        "delivery_expectations": "Food must arrive in insulated eco-friendly packaging without thermal breakdown",
        "tech_familiarity": "Moderate-High",
        "motivations": ["Verified nutrient disclosures", "Fresh organic ingredients", "Consistent portion sizing"],
        "frustrations": ["Deceptive 'healthy' labels loaded with sugar or hidden palm oil", "Soggy salads"],
        "objections": ["Can SwiftBite verify ingredient sourcing and hygiene audits for its healthy section?"],
        "feature_preferences": ["Healthy food curated section with verified macros", "Eco-friendly insulated packaging"],
        "communication_style": "Detail-oriented, clinical, discerning, health-first",
        "behavioral_tendencies": ["Reads all ingredient tags before clicking order", "Willing to pay premium for quality"],
        "assumptions": ["Assumes healthy section has dietician-approved calorie breakdowns"],
        "consistency_profile": {
            "willingness_to_pay_delivery_fee": "high",
            "time_sensitivity": 7.5,
            "health_importance": 10.0,
            "subscription_interest": 8.5
        }
    },
    {
        "name": "Rohan Mehra",
        "avatar": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        "age": 31,
        "occupation": "Management Consultant",
        "segment": "Frequent food delivery customer",
        "schedule": "8:30 AM – 10:30 PM, heavy client travel and tight deliverables",
        "budget": "Very High (₹25,000/month on delivery & corporate dining)",
        "food_habits": "Relies on delivery for breakfast, lunch, and dinner when traveling or working late",
        "dietary_prefs": "Flexible, North Indian, Asian, Continental",
        "delivery_expectations": "Precision delivery: knows exactly when the bell will ring between calls",
        "tech_familiarity": "High",
        "motivations": ["Zero friction ordering", "Real-time live map tracking", "Subscription with priority dispatch"],
        "frustrations": ["Riders calling multiple times for gate directions", "Food delay during monsoons"],
        "objections": ["Needs proof that 30-min delivery doesn't compromise food freshness"],
        "feature_preferences": ["Live order tracking", "30-minute delivery promise", "Subscription plan for unlimited delivery"],
        "communication_style": "Decisive, executive, demanding, value-over-price",
        "behavioral_tendencies": ["Subscribes to annual premium tiers instantly if delivery is guaranteed on time"],
        "assumptions": ["Assumes priority routing is provided to subscription members"],
        "consistency_profile": {
            "willingness_to_pay_delivery_fee": "very_high_for_speed",
            "time_sensitivity": 10.0,
            "health_importance": 6.5,
            "subscription_interest": 10.0
        }
    }
]

# Comprehensive Indian Demographic Pools with Age & Gender Nuances
DEMOGRAPHIC_POOLS = {
    "senior_academic": [
        ("Prof. Harish Nambiar", 54, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
        ("Dr. Suniti Routray", 49, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
        ("Dr. Debashis Mohapatra", 52, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"),
        ("Prof. Meera Krishnan", 47, "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80"),
        ("Dr. K. Ramaswamy", 58, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"),
        ("Prof. Ananya Sen", 45, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
    ],
    "corporate_pro": [
        ("Aditya Verma", 32, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
        ("Sneha Reddy", 29, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        ("Karthik Sundaram", 35, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"),
        ("Divya Nair", 28, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"),
        ("Vikram Chawla", 37, "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"),
        ("Ishita Sen", 31, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
        ("Rohit Sengupta", 33, "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80")
    ],
    "health_wellness": [
        ("Dr. Deepika Rao", 36, "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80"),
        ("Ananya Iyer", 33, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
        ("Raghavan Pillai", 42, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"),
        ("Pooja Hegde", 27, "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80")
    ],
    "student_young": [
        ("Nikhil Kulkarni", 22, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80"),
        ("Tanvi Deshmukh", 23, "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"),
        ("Rhea Chakraborty", 24, "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80"),
        ("Varun Bhat", 25, "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150&auto=format&fit=crop&q=80"),
        ("Shreya Joshi", 21, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
    ],
    "creative_freelance": [
        ("Kabir Mehta", 29, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
        ("Tara Alva", 27, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        ("Aman Qureshi", 31, "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"),
        ("Zoya Siddiqui", 28, "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80")
    ],
    "service_operations": [
        ("Capt. Rajesh Menon", 41, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"),
        ("Pooja Nair", 30, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
        ("Sameer Tripathy", 38, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"),
        ("Kavita Das", 34, "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80")
    ],
    "general": [
        ("Amitabh Pradhan", 44, "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"),
        ("Sanjay Murthy", 38, "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"),
        ("Ayesha Farooqi", 34, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"),
        ("Siddharth Menon", 36, "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"),
        ("Sunita Patil", 48, "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80"),
        ("Tanmay Ghosh", 29, "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80")
    ]
}

INDIAN_FIRST_NAMES_MALE = [
    "Aarav", "Aditya", "Arjun", "Dev", "Ishaan", "Kabir", "Karthik", "Madhav", 
    "Nikhil", "Pranav", "Raghav", "Rohan", "Sameer", "Siddharth", "Varun", "Vikram",
    "Debashis", "Bikash", "Soumya", "Satyajit", "Alok", "Manish", "Harish", "Gautam",
    "Sanjay", "Amitabh", "Rajesh", "Suresh", "Manoj", "Chinmay", "Subhash", "Tushar",
    "Deepak", "Anirudh", "Abhinav", "Kunal", "Rishi", "Mayank", "Chirag", "Tarun"
]

INDIAN_FIRST_NAMES_FEMALE = [
    "Aditi", "Ananya", "Deepika", "Divya", "Ishita", "Kavita", "Meera", "Pooja", 
    "Priya", "Rhea", "Shreya", "Sneha", "Sunita", "Tanvi", "Zoya", "Rashmi", 
    "Nandini", "Swati", "Geeta", "Lakshmi", "Parvati", "Sandhya", "Bhavna", "Jyoti",
    "Shalini", "Pallavi", "Rupali", "Neha", "Kritika", "Preeti", "Simran", "Vandana",
    "Aishwarya", "Shruti", "Anjali", "Monika", "Rupashree", "Madhuri", "Poonam"
]

INDIAN_LAST_NAMES = [
    "Sharma", "Verma", "Reddy", "Nair", "Iyer", "Patel", "Sundaram", "Menon", 
    "Rao", "Chawla", "Mehra", "Sen", "Sengupta", "Pillai", "Deshmukh", "Kulkarni", 
    "Bhat", "Joshi", "Chakraborty", "Alva", "Qureshi", "Siddiqui", "Tripathy", "Das", 
    "Patnaik", "Mohapatra", "Nambiar", "Routray", "Pradhan", "Murthy", "Farooqi", "Patil", 
    "Ghosh", "Mishra", "Samal", "Behera", "Acharya", "Panda", "Hegde", "Shenoy", 
    "Bhattacharya", "Mukherjee", "Banerjee", "Kapoor", "Malhotra", "Bansal", "Agarwal", 
    "Gupta", "Singhania", "Choudhury", "Bose", "Dutta", "Goswami", "Venkatesh"
]

PORTRAIT_AVATARS = [
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80"
]

def split_prompt_into_personas(prompt_text: Optional[str], count: int) -> List[str]:
    """
    Intelligently splits a user prompt that contains multiple persona requests
    (e.g. '1. ..., 2. ...' or 'a developer who..., a student who..., and a doctor who...')
    into distinct individual persona descriptions.
    """
    if not prompt_text or count <= 1:
        return [prompt_text or ""] * max(1, count)

    raw = prompt_text.strip()

    # 1. Numbered items: 1. ... 2. ... or 1) ... 2) ... or Persona 1: ...
    numbered = re.split(
        r'(?:^|\s+)(?:[1-9]\s*[\.\:\-\)]|\b(?:persona\s*[1-9]|first|second|third|fourth|fifth|sixth)\s*[\:\-\)]?)\s*',
        raw,
        flags=re.IGNORECASE
    )
    cleaned_num = [p.strip(' ,;:') for p in numbered if len(p.strip(' ,;:')) > 5]
    if len(cleaned_num) >= count:
        return cleaned_num[:count]

    # 2. Conjunctions: 'and a/an/1', ', a/an/1', '; 1'
    conjunction = re.split(
        r';|\band\s+(?:a|an|one|\d+)\s+|,?\s*and\s+(?:a|an|one|\d+)\s+|,?\s*also\s+(?:a|an|one|\d+)\s+',
        raw,
        flags=re.IGNORECASE
    )
    cleaned_conj = [p.strip(' ,;:') for p in conjunction if len(p.strip(' ,;:')) > 5]
    if len(cleaned_conj) >= count:
        return cleaned_conj[:count]

    # 3. Comma-separated clauses if count matches
    commas = [c.strip(' ,;:') for c in raw.split(',') if len(c.strip(' ,;:')) > 8]
    if len(commas) >= count:
        return commas[:count]

    # Fallback: same prompt for all, variations will be generated by demographic & seniority tier
    return [raw] * count

def extract_custom_role(text: str) -> str:
    """
    Extracts arbitrary occupation/role titles from natural language while cleaning
    conversational prefixes like 'i want a', 'looking for a', 'generate an', etc.
    """
    cleaned = re.sub(r'^(?:i\s+(?:want|need|wish|prefer|seek)|want|need|looking\s+for|search\s+for|generate|create|simulate|give\s+me|find)\b\s*', '', text, flags=re.IGNORECASE).strip()
    cleaned = re.sub(r'^(?:\b(?:a|an|the|one|\d+)\b\s*)+', '', cleaned, flags=re.IGNORECASE).strip()
    m = re.search(r'^([a-z\s]{3,35}?)(?:\s+(?:who|in|with|that|living|working|ordering|operating|based|eating|needing|at\b))', cleaned, re.IGNORECASE)
    if m and len(m.group(1).strip()) > 2:
        return m.group(1).strip().title()
    words = cleaned.split()[:4]
    return ' '.join(words).title() if words else "Professional"

def parse_user_persona_prompt(prompt_text: str, builder_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Intelligent Semantic Parser that extracts exact role, location, dishes, timing, hates, and budgets
    directly from user's freeform text or structured builder parameters.
    """
    combined_text = (
        f"{prompt_text or ''} {builder_data.get('segment_focus') or ''} "
        f"{builder_data.get('routine_schedule') or ''} {builder_data.get('dietary_prefs') or ''} "
        f"{builder_data.get('delivery_expectations') or ''} {builder_data.get('fee_sensitivity') or ''} "
        f"{builder_data.get('custom_instructions') or ''}"
    ).strip()
    text_lower = combined_text.lower()

    # 1. Exact or inferred occupation mapping
    occ_map = [
        (r'college\s+professor|professor', 'College Professor', 'Academic & Faculty Professional', 'senior_academic'),
        (r'lecturer|faculty|academic', 'University Lecturer', 'Academic Professional', 'senior_academic'),
        (r'teacher|educator|school\s+teacher', 'Senior Educator', 'Education Professional', 'senior_academic'),
        (r'doctor|physician|surgeon|cardiologist', 'Consulting Physician', 'Healthcare Professional', 'health_wellness'),
        (r'nurse|nursing|healthcare\s+worker', 'Clinical Care Nurse', 'Healthcare Professional', 'service_operations'),
        (r'software\s+engineer|sde|developer|programmer|techie|coder', 'Software Engineer', 'Time-pressed corporate professional', 'corporate_pro'),
        (r'architect|cloud\s+architect|devops|sre', 'Cloud Systems Architect', 'Time-pressed corporate professional', 'corporate_pro'),
        (r'consultant|analyst|associate', 'Management Consultant', 'High-velocity professional', 'corporate_pro'),
        (r'founder|entrepreneur|ceo|cto|cpo|startup', 'Startup Founder & CEO', 'High-growth entrepreneur', 'corporate_pro'),
        (r'student|college\s+student|undergrad|scholar|hostel', 'University Student', 'Budget-conscious student / flatmate', 'student_young'),
        (r'intern|fresher|trainee', 'Graduate Corporate Intern', 'Budget-conscious student / flatmate', 'student_young'),
        (r'trainer|fitness\s+coach|gym|athlete|yoga', 'Fitness & Wellness Coach', 'Health & Fitness Professional', 'health_wellness'),
        (r'photographer|videographer|camera', 'Commercial Photographer', 'Creative Media Professional', 'creative_freelance'),
        (r'designer|ui[\s\/]ux|graphic\s+designer', 'Lead Product Designer', 'Creative Design Professional', 'creative_freelance'),
        (r'pilot|airline|aviation|flight', 'Commercial Airline Pilot', 'High-Discretion Flight Professional', 'service_operations'),
        (r'lawyer|advocate|attorney|legal', 'Corporate Legal Counsel', 'Legal Professional', 'corporate_pro'),
        (r'night[\s-]shift|midnight|bpo', 'Night-Shift Systems Specialist', 'Night-shift worker', 'corporate_pro'),
        (r'family|parent|mother|father', 'Home Manager & Parent', 'Family & Community Diner', 'general'),
        (r'senior|retired|elderly|grandfather|grandmother|diabetic', 'Retired Senior Citizen', 'Senior citizen & diabetic-conscious diner', 'senior_academic')
    ]

    extracted_occ = None
    extracted_seg = None
    pool_key = 'general'
    for pattern, occ, seg, p_key in occ_map:
        if re.search(pattern, text_lower):
            extracted_occ = occ
            extracted_seg = seg
            pool_key = p_key
            break

    # If no predefined regex matched, dynamically extract role from freeform text
    if not extracted_occ:
        extracted_occ = extract_custom_role(combined_text)
        extracted_seg = f"{extracted_occ} Specialist"
        pool_key = 'corporate_pro'

    # 2. Location / City
    cities = [
        'bhubaneswar', 'cuttack', 'puri', 'kalinganagar', 'patia', 'saheed nagar', 
        'chandrasekharpur', 'bengaluru', 'bangalore', 'whitefield', 'koramangala', 
        'hyderabad', 'hitec city', 'gachibowli', 'chennai', 'mumbai', 'pune', 
        'kolkata', 'delhi', 'gurgaon', 'noida', 'ahmedabad', 'jaipur', 'kochi'
    ]
    extracted_city = None
    for c in cities:
        if c in text_lower:
            extracted_city = c.title()
            break
    if not extracted_city:
        extracted_city = "Bhubaneswar" if "kadappa" in text_lower else "Metro India"

    # 3. Timing & Schedule
    time_match = re.search(r'(\d{1,2}(?::\d{2})?\s*(?:am|pm))', text_lower)
    extracted_time = time_match.group(1).upper() if time_match else None
    if not extracted_time:
        if any(k in text_lower for k in ["night", "midnight", "shift", "late", "2am", "3am", "1am"]):
            extracted_time = "2:00 AM"
        elif any(k in text_lower for k in ["breakfast", "morning", "standup", "early"]):
            extracted_time = "8:00 AM"
        elif any(k in text_lower for k in ["lunch", "afternoon", "noon"]):
            extracted_time = "1:00 PM"
        else:
            extracted_time = "7:45 AM"

    # 4. Specific Hates / Frustrations / Dislikes
    hate_match = re.search(r'(?:hates?|dislikes?|annoyed by|refuses?|complaining of|avoids?|hating|without)\s+([^,.]+)', text_lower)
    extracted_hate = hate_match.group(1).strip() if hate_match else None

    # 5. Culinary & Dishes
    food_tags = []
    dish_patterns = [
        (r'podi\s+idli|spicy\s+podi', 'Spicy Ghee Podi Idli'),
        (r'filter\s+coffee|degree\s+coffee|coffee', 'Kumbakonam Degree Filter Coffee'),
        (r'millet|ragi|foxtail', 'Foxtail Millet & Ragi Dosa'),
        (r'medu\s+vada|vada', 'Crispy Medu Vada with Hot Sambar'),
        (r'masala\s+dosa|dosa', 'Butter Masala Dosa'),
        (r'thatte\s+idli', 'Steamed Thatte Idli with Gunpowder Ghee'),
        (r'set\s+dosa', 'Set Dosa with Vegetable Sagu'),
        (r'thali', 'Authentic South Indian Meals Thali'),
        (r'upma', 'Ghee Roasted Rava Upma'),
        (r'pongal', 'Ven Pongal with Cashews'),
        (r'jain|pure\s+veg|no\s+onion', '100% Pure Jain Sattvic Dosa (No Onion/Garlic)'),
        (r'sugar-free|low\s+sugar', 'Sugar-Free Filter Coffee'),
        (r'low\s+salt|diabetic', 'Diabetic-Friendly Low-Glycemic Breakfast'),
        (r'vegan|curd\s+rice', 'Traditional Curd Rice with Mustard Tempering')
    ]
    for p, name in dish_patterns:
        if re.search(p, text_lower):
            if name not in food_tags:
                food_tags.append(name)
    
    if not food_tags:
        food_tags = ['Crispy Masala Dosa', 'Kumbakonam Filter Coffee']

    # 6. Budget
    budget_match = re.search(r'(?:₹|rs\.?|inr)?\s*(\d{1,2}[,\d]{2,6})\b', text_lower)
    extracted_budget = None
    if budget_match:
        extracted_budget = f"₹{budget_match.group(1)}/month on dining & deliveries"
    elif any(k in text_lower for k in ["tight", "budget", "cheap", "student", "hostel"]):
        extracted_budget = "₹4,200/month maximum food spending"
    elif any(k in text_lower for k in ["unlimited", "vip", "executive", "high budget", "founder", "director"]):
        extracted_budget = "₹22,000/month on premium food and coffee"
    else:
        extracted_budget = "₹9,500/month on quality food delivery"

    return {
        "occupation": extracted_occ,
        "segment": extracted_seg,
        "pool_key": pool_key,
        "city": extracted_city,
        "time": extracted_time,
        "hate": extracted_hate,
        "food_tags": food_tags,
        "budget": extracted_budget
    }

class PersonaEngine:
    async def generate_personas(
        self,
        workspace_id: str,
        count: int = 4,
        target_market: str = "Working professionals in Metro India",
        product_description: Optional[str] = "Kadappa Cafe — Authentic South Indian & Smart Food Delivery App",
        need_description: Optional[str] = None,
        segment_focus: Optional[str] = None,
        routine_schedule: Optional[str] = None,
        monthly_budget: Optional[str] = None,
        dietary_prefs: Optional[str] = None,
        delivery_expectations: Optional[str] = None,
        fee_sensitivity: Optional[str] = None,
        custom_instructions: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Dynamically synthesizes exactly `count` unique, non-duplicated personas that directly
        and accurately embody the user's specific request and criteria.
        Uses Groq LLM if live API is available, or our comprehensive multi-persona
        semantic generative engine.
        """
        builder_data = {
            "segment_focus": segment_focus,
            "routine_schedule": routine_schedule,
            "monthly_budget": monthly_budget,
            "dietary_prefs": dietary_prefs,
            "delivery_expectations": delivery_expectations,
            "fee_sensitivity": fee_sensitivity,
            "custom_instructions": custom_instructions
        }

        # -------------------------------------------------------------
        # 1. LIVE LLM ATTEMPT (If Groq client is configured and online)
        # -------------------------------------------------------------
        if llm_service.is_live_available():
            try:
                system_prompt = (
                    "You are the Principal Synthetic Persona Architect at REGALUX AI. "
                    "Generate exactly {count} distinct, realistic, rich synthetic customer personas in valid JSON format. "
                    "The personas must directly embody the user's explicit instructions, target market, and product context. "
                    "Return ONLY a JSON object with a single key 'personas' containing an array of persona objects with fields: "
                    "name, avatar, age, occupation, segment, schedule, budget, food_habits, dietary_prefs, delivery_expectations, "
                    "tech_familiarity, motivations (list of strings), frustrations (list of strings), objections (list of strings), "
                    "feature_preferences (list of strings), communication_style, behavioral_tendencies (list of strings), "
                    "assumptions (list of strings), consistency_profile (object with willingness_to_pay_delivery_fee, time_sensitivity (0-10), "
                    "health_importance (0-10), subscription_interest (0-10))."
                ).replace("{count}", str(count))

                user_prompt = (
                    f"Product: {product_description}\n"
                    f"Target Market: {target_market}\n"
                    f"User Need: {need_description or 'Diverse representative customers for South Indian cafe delivery'}\n"
                    f"Count Needed: {count}\n"
                    f"Structured Criteria: {json.dumps(builder_data)}"
                )

                llm_res = await llm_service.generate_completion(
                    system_prompt=system_prompt,
                    user_prompt=user_prompt,
                    temperature=0.75,
                    json_mode=True
                )

                if llm_res.get("live") and llm_res.get("content"):
                    parsed_llm = json.loads(llm_res["content"])
                    personas_list = parsed_llm.get("personas", [])
                    if isinstance(personas_list, list) and len(personas_list) >= count:
                        res = []
                        for item in personas_list[:count]:
                            item["workspace_id"] = workspace_id
                            if not item.get("avatar"):
                                item["avatar"] = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                            res.append(item)
                        return res
            except Exception as e:
                # Log and smoothly fallback to generative semantic engine
                pass

        # -------------------------------------------------------------
        # 2. GENERATIVE SEMANTIC SYNTHESIS ENGINE (100% Dynamic Fallback)
        # -------------------------------------------------------------
        # Split prompt into per-persona sub-prompts for multi-persona requests
        sub_prompts = split_prompt_into_personas(need_description, count)

        generated = []
        used_names = set()

        for i in range(count):
            sub_p = sub_prompts[i % len(sub_prompts)]
            parsed = parse_user_persona_prompt(sub_p, builder_data)

            pool_key = parsed["pool_key"]
            candidate_pool = list(DEMOGRAPHIC_POOLS.get(pool_key, DEMOGRAPHIC_POOLS["corporate_pro"]))
            # Also combine other pools to prevent duplicates
            for k, pool in DEMOGRAPHIC_POOLS.items():
                if k != pool_key:
                    candidate_pool.extend([p for p in pool if p not in candidate_pool])

            # Select an unused demographic entry
            pool_entry = None
            for cand in candidate_pool:
                if cand[0] not in used_names:
                    pool_entry = cand
                    used_names.add(cand[0])
                    break
            
            if pool_entry:
                name = pool_entry[0]
                base_age = pool_entry[1]
                avatar = pool_entry[2]
                age = max(20, min(68, base_age + (i % 7) - 3))
            else:
                # Dynamically generate unique Indian name if candidates run out (e.g. count=20, 50, 100, 200, 500)
                is_female = (i % 2 == 1)
                f_pool = INDIAN_FIRST_NAMES_FEMALE if is_female else INDIAN_FIRST_NAMES_MALE
                fn = f_pool[(i // len(INDIAN_LAST_NAMES)) % len(f_pool)]
                ln = INDIAN_LAST_NAMES[i % len(INDIAN_LAST_NAMES)]
                name = f"{fn} {ln}"
                attempts = 0
                while name in used_names and attempts < 60:
                    fn = random.choice(f_pool)
                    ln = random.choice(INDIAN_LAST_NAMES)
                    name = f"{fn} {ln}"
                    attempts += 1
                if name in used_names:
                    name = f"{fn} {ln} ({i + 1})"
                used_names.add(name)
                age = 22 + ((i * 7) % 44)
                avatar = PORTRAIT_AVATARS[i % len(PORTRAIT_AVATARS)]

            base_occ = parsed["occupation"]
            base_seg = parsed["segment"]
            city = parsed["city"]
            target_time = parsed["time"]
            extracted_hate = parsed["hate"]
            food_list = parsed["food_tags"]
            base_budget = parsed["budget"]

            # Seniority variations if prompt didn't specify distinct roles
            if len(sub_prompts) == 1 and count > 1:
                seniority_prefixes = [
                    "Senior", "Associate", "Lead", "Principal", "Visiting", "Consulting",
                    "Staff", "Chief", "Independent", "Assistant", "Executive", "Freelance"
                ]
                prefix = seniority_prefixes[i % len(seniority_prefixes)]
                occupation = f"{prefix} {base_occ}"
            else:
                occupation = base_occ

            # Dynamic schedule incorporating location, shift, and timing
            is_night = any(k in sub_p.lower() for k in ["night", "midnight", "shift", "3am", "2am", "1am", "4am"]) or "night" in base_seg.lower()
            if is_night:
                schedule = f"9:30 PM shift duty in {city}, {target_time} hot tiffin break, 6:00 AM morning shift handoff"
            else:
                schedule = f"6:45 AM morning prep, {target_time} prompt breakfast delivery in {city}, 8:30 AM core schedule start"

            # Dynamic dietary preferences
            primary_food = food_list[i % len(food_list)]
            secondary_food = food_list[(i + 1) % len(food_list)] if len(food_list) > 1 else "Filter Coffee"
            diet_str = f"{primary_food} with fresh chutney and {secondary_food}"
            
            food_habits = (
                f"Relies on Kadappa Cafe 4-5 mornings a week in {city} for {primary_food}; "
                f"needs predictable arrival at {target_time} before starting daily responsibilities."
            )

            # Dynamic frustrations embodying the user's explicit input
            frustrations = []
            if extracted_hate:
                frustrations.append(f"{extracted_hate.capitalize()} that disrupts routine or meal enjoyment")
            else:
                frustrations.append("Lukewarm food and delivery delays exceeding 15 minutes")
            
            frustrations.append(f"Inaccurate ETA tracking when trying to time delivery for {target_time}")
            frustrations.append("Flimsy packaging causing spillage of hot sambar or chutneys")

            # Dynamic objections embodying user's explicit input
            objections = []
            if extracted_hate:
                objections.append(f"Will refuse order or pause subscription if {extracted_hate} occurs.")
            else:
                objections.append(f"Why pay delivery fees if food cannot arrive piping hot by {target_time}?")
            
            objections.append("₹99 per order fee is too steep unless bundled into an unlimited monthly morning pass.")

            # Dynamic motivations
            motivations = [
                f"Piping hot {primary_food} delivered reliably at {target_time} sharp in {city}",
                "Authentic traditional taste without refined palm oils or excess baking soda",
                "Frictionless ordering with Kadappa Cafe morning delivery subscription"
            ]

            # Dynamic consistency profile calibrated to input
            time_score = 9.5 if ("30-min" in schedule or "am" in target_time.lower() or "standup" in sub_p.lower()) else 8.0
            health_score = 9.8 if any(k in diet_str.lower() for k in ["millet", "ragi", "jain", "sugar-free", "diabetic", "zero-oil"]) else 7.5
            sub_score = 9.2 if (fee_sensitivity and "pass" in fee_sensitivity.lower()) or "student" not in occupation.lower() else 6.5
            fee_tol = "very_low" if any(k in sub_p.lower() for k in ["student", "budget", "cheap", "hostel"]) else "low_per_order_high_for_monthly_sub"

            persona = {
                "workspace_id": workspace_id,
                "name": name,
                "avatar": avatar,
                "age": age,
                "occupation": occupation,
                "segment": base_seg,
                "schedule": schedule,
                "budget": base_budget,
                "food_habits": food_habits,
                "dietary_prefs": diet_str,
                "delivery_expectations": f"Strict delivery by {target_time} in insulated thermal packaging",
                "tech_familiarity": "Expert" if any(k in occupation.lower() for k in ["engineer", "developer", "architect", "student"]) else "High",
                "motivations": motivations,
                "frustrations": frustrations,
                "objections": objections,
                "feature_preferences": [
                    f"Express delivery guaranteed by {target_time}",
                    "Kadappa Cafe Morning Pass (₹199/month for unlimited zero-fee deliveries)",
                    "Insulated thermal packaging keeping food at 65°C+ in transit",
                    "Live pan-to-porch GPS tracking"
                ],
                "communication_style": f"Discerning, {occupation.split(' ')[0].lower()}-oriented, authentic South Indian breakfast customer",
                "behavioral_tendencies": [
                    f"Places recurring morning order for {target_time} slot",
                    "Reviews live order tracking if ETA fluctuates by more than 5 minutes"
                ],
                "assumptions": [
                    "Assumes Kadappa Cafe prepares fresh stone-ground batter and brews pure degree coffee without chicory adulteration"
                ],
                "consistency_profile": {
                    "willingness_to_pay_delivery_fee": fee_tol,
                    "time_sensitivity": time_score,
                    "health_importance": health_score,
                    "subscription_interest": sub_score
                }
            }
            generated.append(persona)

        return generated

persona_engine = PersonaEngine()
