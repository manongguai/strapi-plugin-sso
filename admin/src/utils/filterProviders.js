// import microsoftLogo from "../assets/imgs/Microsoft_logo.png";

const providers = [
  {
    uid: "azure_ad_oauth2",
    displayName: "Microsoft",
    // icon: microsoftLogo,
  },
];

export function filterProviders(allowProviders) {
  return providers.filter((provider) => {
    return allowProviders.includes(provider.uid);
  });
}
