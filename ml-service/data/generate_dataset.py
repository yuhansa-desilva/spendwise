import csv
import random
from pathlib import Path

random.seed(42)  # same seed = same dataset every time you run this

ITEMS = {
    "Food": [
        "KFC", "Pizza Hut", "McDonalds", "Dominos Pizza", "Burger King",
        "Perera and Sons", "Ministry of Crab", "Chinese Dragon Cafe",
        "Hotel de Pilawoos", "Dilmah t-Lounge", "rice and curry", "kottu",
        "lunch packet", "short eats", "bakery bun", "coffee shop",
        "Cafe latte", "dinner restaurant", "breakfast hoppers", "fried rice",
        "food delivery",
    ],
    "Groceries": [
        "Keells Super", "Cargills Food City", "Arpico Supercentre",
        "Laugfs Super", "Sathosa", "vegetable market", "fruit stall",
        "fish market", "dairy milk powder", "rice and dhal", "eggs and bread",
        "supermarket groceries", "grocery shopping", "pola vegetables",
        "coconut and spices",
    ],
    "Transport": [
        "Uber ride", "PickMe ride", "bus ticket", "train ticket",
        "Sri Lanka Railways", "Ceypetco fuel", "Lanka IOC fuel", "petrol",
        "diesel", "expressway toll", "parking fee", "tuk tuk fare",
        "taxi fare", "vehicle service", "bike fuel",
    ],
    "Bills": [
        "Ceylon Electricity Board", "CEB electricity bill", "water bill",
        "NWSDB payment", "Dialog mobile reload", "Mobitel bill",
        "SLT broadband", "internet bill", "house rent", "insurance premium",
        "gas cylinder", "mobile data package", "phone bill",
        "apartment maintenance fee", "TV cable bill",
    ],
    "Entertainment": [
        "Netflix", "Spotify", "YouTube Premium", "Scope Cinemas",
        "Majestic Cineplex", "cinema ticket", "movie tickets",
        "concert ticket", "Steam game", "PlayStation store", "Disney Plus",
        "bowling", "arcade games", "night club cover", "theatre show",
    ],
    "Health": [
        "Nawaloka Hospital", "Asiri Hospital", "Lanka Hospitals",
        "Healthguard Pharmacy", "Osu Sala", "pharmacy", "medicines",
        "doctor channeling", "dental clinic", "laboratory tests",
        "eye test spectacles", "gym membership", "vitamins", "physiotherapy",
        "clinic fee",
    ],
    "Shopping": [
        "Odel", "Cool Planet", "House of Fashions", "Daraz order",
        "Amazon order", "Softlogic", "Singer appliances", "Abans electronics",
        "clothing store", "shoes", "t-shirt", "phone case",
        "electronics shop", "online shopping", "department store",
    ],
    "Other": [
        "ATM withdrawal", "cash withdrawal", "bank charges", "service charge",
        "transfer to friend", "donation", "charity", "temple offering",
        "gift", "haircut salon", "miscellaneous", "unknown payment",
        "stationery", "courier fee", "laundry",
    ],
}

PLACES = [
    "Colombo", "Kandy", "Galle", "Jaffna", "Kegalle",
    "Negombo", "Matara", "Kurunegala", "Nugegoda", "Dehiwala",
]

TEMPLATES = [
    "{item}",
    "{item}",
    "{item} {place}",
    "{item} - {place}",
    "POS {item}",
    "CARD PAYMENT {item}",
    "{item} purchase",
    "payment to {item}",
    "{item} #{num}",
    "{item} {place} LK",
]

ROWS_PER_CATEGORY = 300


def add_noise(text):
    """Make the text a little messy, like real bank statements."""
    r = random.random()
    if r < 0.25:
        return text.upper()
    if r < 0.45:
        return text.lower()
    if r < 0.55 and len(text) > 5:
        i = random.randrange(1, len(text) - 1)  # drop one character (a typo)
        return text[:i] + text[i + 1:]
    return text


rows = []
seen = set()

for category, items in ITEMS.items():
    count = 0
    attempts = 0
    while count < ROWS_PER_CATEGORY and attempts < ROWS_PER_CATEGORY * 50:
        attempts += 1
        text = random.choice(TEMPLATES).format(
            item=random.choice(items),
            place=random.choice(PLACES),
            num=random.randint(100, 9999),
        )
        text = add_noise(text)
        if (text, category) not in seen:
            seen.add((text, category))
            rows.append((text, category))
            count += 1

random.shuffle(rows)

out_path = Path(__file__).parent / "transactions.csv"
with open(out_path, "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["description", "category"])
    writer.writerows(rows)

print(f"Wrote {len(rows)} rows to {out_path}")
for category in ITEMS:
    n = sum(1 for _, c in rows if c == category)
    print(f"  {category}: {n}")