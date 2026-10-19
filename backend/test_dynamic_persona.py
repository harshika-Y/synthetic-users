import asyncio
import sys
sys.path.insert(0, 'backend')
from app.services.persona_engine import persona_engine

async def main():
    print("=== TEST 1: MULTI-PERSONA DISTINCT BREAKDOWN ===")
    p_multi = await persona_engine.generate_personas(
        workspace_id="test-ws",
        count=3,
        need_description="1 corporate developer who needs hot filter coffee and ghee roast before 8:30 AM standup, 1 fitness enthusiast who only eats zero-oil ragi/millet idlis, and 1 price-conscious student who splits breakfast orders with flatmates."
    )
    for idx, p in enumerate(p_multi, 1):
        print(f"Persona {idx}: {p['name']} ({p['age']})")
        print(f"  Occupation : {p['occupation']}")
        print(f"  Segment    : {p['segment']}")
        print(f"  Schedule   : {p['schedule']}")
        print(f"  Dietary    : {p['dietary_prefs']}")
        budget_str = p['budget'].replace('₹', 'Rs.')
        print(f"  Budget     : {budget_str}")

    print("\n=== TEST 2: CUSTOM ARBITRARY ROLE WITH SPECIFIC DISLIKES ===")
    p_custom = await persona_engine.generate_personas(
        workspace_id="test-ws",
        count=1,
        need_description="A high school physics teacher in Bhubaneswar who needs spicy podi idli delivered at 6:45 AM and hates lukewarm coffee"
    )
    p = p_custom[0]
    print(f"Persona: {p['name']} ({p['age']})")
    print(f"  Occupation   : {p['occupation']}")
    print(f"  Schedule     : {p['schedule']}")
    print(f"  Dietary      : {p['dietary_prefs']}")
    print(f"  Frustrations : {p['frustrations']}")
    obj_str = str(p['objections']).replace('₹', 'Rs.')
    print(f"  Objections   : {obj_str}")

    print("\n=== TEST 3: AIRLINE PILOT AT 4:00 AM ===")
    p_pilot = await persona_engine.generate_personas(
        workspace_id="test-ws",
        count=1,
        need_description="An airline pilot based in Mumbai who requires hot filter coffee and medu vada at 4:00 AM before dawn departures"
    )
    p2 = p_pilot[0]
    print(f"Persona: {p2['name']} ({p2['age']})")
    print(f"  Occupation   : {p2['occupation']}")
    print(f"  Schedule     : {p2['schedule']}")
    print(f"  Dietary      : {p2['dietary_prefs']}")

if __name__ == "__main__":
    asyncio.run(main())
