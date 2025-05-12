-- Add image URLs to items based on their category/type
UPDATE item
SET imageUrl = 
    CASE 
        WHEN category = 'weapon' AND type = 'sword' THEN '/images/items/sword.svg'
        WHEN category = 'weapon' AND type = 'shield' THEN '/images/items/shield.svg'
        WHEN category = 'weapon' AND type = 'dagger' THEN '/images/items/dagger.svg'
        WHEN category = 'weapon' AND type = 'bow' THEN '/images/items/bow.svg'
        WHEN category = 'weapon' AND type = 'staff' THEN '/images/items/staff.svg'
        WHEN category = 'weapon' AND type = 'orb' THEN '/images/items/orb.svg'
        WHEN category = 'head' THEN '/images/items/helmet.svg'
        WHEN category = 'body' THEN '/images/items/armor.svg'
        WHEN category = 'legs' THEN '/images/items/boots.svg'
        WHEN category = 'consumable' AND type = 'potion' THEN '/images/items/potion.svg'
        WHEN category = 'consumable' AND type = 'food' THEN '/images/items/food.svg'
        WHEN category = 'consumable' AND type = 'scroll' THEN '/images/items/scroll.svg'
        ELSE NULL
    END
WHERE imageUrl IS NULL;

-- Add image URLs to spells based on their element
UPDATE spell
SET imageUrl = 
    CASE 
        WHEN element = 'flame' THEN '/images/spells/flame.svg'
        WHEN element = 'aqua' THEN '/images/spells/aqua.svg'
        WHEN element = 'gale' THEN '/images/spells/gale.svg'
        WHEN element = 'terra' THEN '/images/spells/terra.svg'
        WHEN element = 'ether' THEN '/images/spells/ether.svg'
        ELSE NULL
    END
WHERE imageUrl IS NULL; 