
"use client";
import React from "react";

type Brand = { name: string; url: string };

const techBrands: Brand[] = [
  { name: "Apple", url: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" },
  { name: "Samsung", url: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg" },
  { name: "Sony", url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/Sony_logo.svg" },
  { name: "Dell", url: "https://upload.wikimedia.org/wikipedia/commons/8/82/Dell_Logo.png" },
  { name: "LG", url: "https://upload.wikimedia.org/wikipedia/commons/2/20/LG_symbol.svg" },
  { name: "Microsoft", url: "https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg" },
  { name: "HP", url: "https://upload.wikimedia.org/wikipedia/commons/a/ad/HP_logo_2012.svg" },
  { name: "Lenovo", url: "https://upload.wikimedia.org/wikipedia/commons/b/b8/Lenovo_logo_2015.svg" },
];

const fashionBrands: Brand[] = [
  { name: "Nike", url: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg" },
  { name: "Adidas", url: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg" },
  { name: "Zara", url: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg" },
  { name: "H&M", url: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg" },
  { name: "Gucci", url: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gucci_logo.svg" },
  { name: "Puma", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Puma_AG_Rudolf_Dassler_Sport_logo.svg/800px-Puma_AG_Rudolf_Dassler_Sport_logo.svg.png" },
  { name: "Levi's", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0a/Levi%27s_logo.svg/800px-Levi%27s_logo.svg.png" },
  { name: "Ralph Lauren", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Polo_Ralph_Lauren_Logo.svg/800px-Polo_Ralph_Lauren_Logo.svg.png" },
];

const foodBrands: Brand[] = [
  { name: "Coca-Cola", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/800px-Coca-Cola_logo.svg.png" },
  { name: "McDonald's", url: "https://upload.wikimedia.org/wikipedia/commons/3/36/McDonald%27s_Golden_Arches.svg" },
  { name: "Nestlé", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Nestl%C3%A9.svg/800px-Nestl%C3%A9.svg.png" },
  { name: "Pepsi", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Pepsi_2023_logo.svg/800px-Pepsi_2023_logo.svg.png" },
  { name: "KFC", url: "https://upload.wikimedia.org/wikipedia/en/thumb/b/bf/KFC_logo.svg/800px-KFC_logo.svg.png" },
  { name: "Starbucks", url: "https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/800px-Starbucks_Corporation_Logo_2011.svg.png" },
  { name: "Subway", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Subway_2016_logo.svg/800px-Subway_2016_logo.svg.png" },
  { name: "Heinz", url: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Heinz_Logo.svg/800px-Heinz_Logo.svg.png" },
];

type RowProps = {
  title: string;
  emoji: string;
  pillStyle: React.CSSProperties;
  brands: Brand[];
  direction?: "left" | "right";
  duration?: string;
};

function Row({ title, emoji, pillStyle, brands, direction = "left", duration = "22s" }: RowProps) {
  const doubled = [...brands, ...brands];
  const animName = direction === "left" ? "scrollLeft" : "scrollRight";

  return (
    <div className="mb-7">
      <div className="flex items-center gap-2 mb-3">
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase"
          style={pillStyle}
        >
          <span className="text-base leading-none">{emoji}</span>
          {title}
        </div>
      </div>

      <div className="relative overflow-hidden rounded-2xl group">
        {/* fade edges */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-10 z-10"
          style={{ background: "linear-gradient(to right, #f7f8fa, transparent)" }} />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-10 z-10"
          style={{ background: "linear-gradient(to left, #f7f8fa, transparent)" }} />

        <div
          className="flex gap-3.5 w-max group-hover:[animation-play-state:paused]"
          style={{ animation: `${animName} ${duration} linear infinite` }}
        >
          {doubled.map((b, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[116px] h-16 bg-white rounded-2xl flex items-center justify-center p-3 border border-black/[0.06] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.url}
                alt={b.name}
                className="max-w-full max-h-full object-contain grayscale-[20%] hover:grayscale-0 transition-all"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (e.target as HTMLImageElement).parentElement!.innerHTML =
                    `<span style="font-size:11px;color:#999">${b.name}</span>`;
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LogoCarousel() {
  return (
    <section className="py-8 bg-[#f7f8fa] rounded-[28px]">
      <style>{`
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Row
          title="Top Tech & Gadgets"
          emoji="💻"
          pillStyle={{ background: "#e8f0fe", color: "#1a56db" }}
          brands={techBrands}
          direction="left"
          duration="22s"
        />
        <Row
          title="Top Fashion Brands"
          emoji="👗"
          pillStyle={{ background: "#fce8f3", color: "#c4267b" }}
          brands={fashionBrands}
          direction="right"
          duration="26s"
        />
        <Row
          title="Popular Food & Drinks"
          emoji="🍔"
          pillStyle={{ background: "#fef3e2", color: "#b45309" }}
          brands={foodBrands}
          direction="left"
          duration="18s"
        />
      </div>
    </section>
  );
}