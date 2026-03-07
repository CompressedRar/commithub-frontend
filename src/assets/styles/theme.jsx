import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    // Primary scale based on rgb(35, 68, 255)
    primary: {
      darker: '#0019b3',    // Darker
      dark: '#162dbf',      // Dark
      main: 'rgb(35, 68, 255)', // Base Color
      light: 'rgb(89, 114, 255)', // Light (from your --lighter-primary)
      lighter: '#dae0ff',   // Lighter
    },
    // Secondary scale based on rgb(255, 212, 95)
    secondary: {
      darker: '#cc9900',    // Darker
      dark: '#ffcc33',      // Dark
      main: 'rgb(255, 212, 95)', // Base Color
      light: '#ffe18f',     // Light
      lighter: '#fff5d6',   // Lighter
    },
    text: {
      primary: 'rgb(82, 82, 82)', // Your --primary-font-color
      secondary: 'rgb(114, 114, 114)', // Your --sec-font-color
    },
    background: {
      default: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    body1: {
      lineHeight: 1.5,
      fontWeight: 400,
      textRendering: 'optimizeLegibility',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          margin: 0;
        }
      `,
    },
  },
});


export default theme;