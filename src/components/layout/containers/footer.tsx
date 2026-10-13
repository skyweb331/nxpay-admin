import { Box, Typography } from "@mui/material";

import { CONFIG } from "@/config";

export default function Footer() {
  return (
    <Box component="footer" className="border-grey-100 flex h-12 items-center justify-center gap-1 border-t">
      <Typography variant="caption" className="text-text-disabled">
        {CONFIG.APP_NAME} v{CONFIG.VERSION} · © {new Date().getFullYear()} NxPay
      </Typography>
    </Box>
  );
}
