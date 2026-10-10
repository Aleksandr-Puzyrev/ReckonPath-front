import {
  AdsPreScreen,
  confirmPreScreen,
  handlePreScreenClosed,
  useAdsConsentStore,
} from "@entities/ad";

const AdsConsentHost = () => {
  const isOpen = useAdsConsentStore((consent) => consent.isPreScreenOpen);

  return (
    <AdsPreScreen isOpen={isOpen} onContinue={confirmPreScreen} onClosed={handlePreScreenClosed} />
  );
};

export default AdsConsentHost;
