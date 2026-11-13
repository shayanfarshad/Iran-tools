type AppLanguage = "fa" | "en";

const fontFamilies = {
  fa: {
    thin: "EstedadThin",
    regular: "EstedadRegular",
    bold: "EstedadBold",
  },
  en: {
    thin: "InterThin",
    regular: "InterRegular",
    bold: "InterBold",
  },
} as const;

export const getTypography = (language: AppLanguage) => {
  const fonts = fontFamilies[language];

  return {
    title: {
      fontSize: 24,
      fontFamily: fonts.bold,
    },
    heading: {
      fontSize: 20,
      fontFamily: fonts.bold,
    },
    body: {
      fontSize: 16,
      fontFamily: fonts.regular,
    },
    bodyMedium: {
      fontSize: 16,
      fontFamily: fonts.regular,
    },
    caption: {
      fontSize: 13,
      fontFamily: fonts.regular,
    },
    thin: {
      fontFamily: fonts.thin,
    },
    regular: {
      fontFamily: fonts.regular,
    },
    bold: {
      fontFamily: fonts.bold,
    },
  };
};
