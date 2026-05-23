const items = [
  'Ankara Prints',
  'Kente Weaving',
  'Adire Dyeing',
  'Dashiki Style',
  'Boubou Elegance',
  'Kitenge Fabric',
  'Mudcloth Textures',
  'Batik Art',
  'Aso-Oke Luxury',
  'Tie-Dye Craft',
];

export default function Marquee() {
  return (
    <section className="py-6 bg-night-950 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap">
        {[...items, ...items].map((item, i) => (
          <span
            key={i}
            className="inline-flex items-center mx-8 font-display text-lg sm:text-xl text-earth-300 font-medium"
          >
            {item}
            <span className="ml-8 w-2 h-2 rounded-full bg-terra-500" />
          </span>
        ))}
      </div>
    </section>
  );
}
