import {
  faCoins,
  faFish,
  faGem,
  faMountain,
  faPlusSquare,
  faTree,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { api } from "~/api/server";
import { getLocale } from "~/i18n";
import { ResourceType } from "~/server/db/client";
import GlobalChatDialog from "./global-chat-dialog";
import InventoryDialog from "./inventory-dialog";
import RealMoneyShopDialog from "./real-money-shop-dialog";
import ShopDialog from "./shop-dialog";
import UserPopover from "./user-dropdown";

export default async function UI({ children }: { children: React.ReactNode }) {
  const locale = getLocale();

  const resources = await api.resource.getAll();

  return (
    <div className="relative h-full">
      {children}
      {/* second col as big as possible */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr_auto] gap-4">
        {/* top menu */}
        <div className="pointer-events-auto col-span-3 flex justify-between gap-12 p-2">
          {/* resources without gems */}
          <div className="flex gap-8">
            {Object.values(ResourceType)
              .filter((resource) => resource !== ResourceType.gems)
              .map((resource) => (
                <div key={resource} className="text-xl">
                  <span>{resourceIconMap[resource]}</span>{" "}
                  <span>
                    {new Intl.NumberFormat(locale).format(resources[resource])}
                  </span>
                </div>
              ))}
          </div>

          <div className="flex cursor-pointer items-center gap-12">
            {/* gems */}
            <RealMoneyShopDialog
              trigger={
                <span className="group text-xl">
                  <span className="text-blue-400">
                    {<FontAwesomeIcon icon={faGem} />}
                  </span>{" "}
                  <span>
                    {new Intl.NumberFormat(locale).format(resources.gems)}
                  </span>
                  <FontAwesomeIcon
                    icon={faPlusSquare}
                    className="ml-2 text-amber-400 transition-transform group-hover:scale-125"
                  />
                </span>
              }
            />

            {/* user info */}
            <UserPopover />
          </div>
        </div>

        {/* left menu */}
        <div className="pointer-events-auto p-2"></div>

        {/* right menu */}
        <div className="pointer-events-auto col-start-3 p-2"></div>

        {/* bottom menu */}
        <div className="pointer-events-auto col-span-3 flex justify-between">
          <div>
            <GlobalChatDialog />
          </div>
          <div>
            <InventoryDialog />
            <ShopDialog />
          </div>
        </div>
      </div>
    </div>
  );
}

const resourceIconMap: Record<ResourceType, React.ReactNode> = {
  [ResourceType.gems]: <FontAwesomeIcon icon={faGem} />,
  [ResourceType.food]: <FontAwesomeIcon icon={faFish} />,
  [ResourceType.wood]: <FontAwesomeIcon icon={faTree} />,
  [ResourceType.stone]: <FontAwesomeIcon icon={faMountain} />, // Replacing faStone with faMountain
  [ResourceType.gold]: <FontAwesomeIcon icon={faCoins} />,
} as const;
