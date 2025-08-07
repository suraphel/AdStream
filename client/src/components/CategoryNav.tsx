import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getCategoryGroup,
  getGroupColor,
  CATEGORY_GROUPS,
  type CategoryGroupKey,
} from "@/lib/categoryGroups";
import {
  Laptop,
  Car,
  Home,
  Briefcase,
  Shirt,
  Gamepad2,
  Smartphone,
  Camera,
  Bike,
  Sofa,
  Plane,
  Zap,
  Truck,
} from "lucide-react";
import { formatNumber } from "@/lib/i18n";

const categoryIcons: Record<string, any> = {
  electronics: Laptop,
  vehicles: Car,
  motorcycles: Zap,
  "motor-vehicles": Car,
  cars: Car,
  trucks: Truck,
  bikes: Bike,
  "real-estate": Home,
  jobs: Briefcase,
  fashion: Shirt,
  "fashion-clothing": Shirt,
  services: Gamepad2,
  phones: Smartphone,
  cameras: Camera,
  furniture: Sofa,
  "airline-tickets": Plane,
};

export function CategoryNav() {
  const { language, t } = useLanguage();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  return (
    <section className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-secondary-800">
            {t("categories.title")}
          </h3>
          <Link href="/categories">
            <span className="text-primary text-sm font-medium hover:text-primary/80 transition-colors cursor-pointer">
              {t("categories.viewAll")}
            </span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {(categories as any[])?.slice(0, 6).map((category: any) => {
            const IconComponent = categoryIcons[category.slug] || Laptop;
            const groupKey = getCategoryGroup(category.slug) || "services";
            const colorClass = getGroupColor(groupKey as CategoryGroupKey);

            return (
              <Link key={category.id} href={`/category/${category.slug}`}>
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group cursor-pointer relative">
                  <div
                    className={`w-12 h-12 bg-${colorClass}-100 rounded-full flex items-center justify-center mb-2 group-hover:bg-${colorClass}-200 transition-colors`}
                  >
                    <IconComponent
                      className={`w-6 h-6 text-${colorClass}-600`}
                    />
                  </div>
                  <span className="text-sm font-medium text-secondary-800 text-center">
                    {language === "am" && category.nameAm
                      ? category.nameAm
                      : category.name}
                  </span>
                  <span className="text-xs text-secondary-600 mt-1">
                    {formatNumber(category.listingCount || 0, language)}{" "}
                    {t("categories.ads")}
                  </span>
                  {/* Category Group Indicator */}
                  {/* <div
                    className={`absolute -top-1 -right-1 w-5 h-5 bg-${colorClass}-500 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                  >
                    {CATEGORY_GROUPS[groupKey as CategoryGroupKey]?.name.charAt(
                      0,
                    )}
                  </div> */}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
