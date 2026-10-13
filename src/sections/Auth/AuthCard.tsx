import { ReactNode } from "react";

import { Box, Chip, Divider, Paper, Typography } from "@mui/material";

import Logo from "@/components/logo/logo";

/** Centered auth card (starter sign-in markup). */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Box className="bg-waves flex min-h-screen w-full items-center justify-center bg-cover bg-fixed bg-center p-4">
      <Paper elevation={3} className="bg-background-paper shadow-darker-xs w-lg max-w-full rounded-4xl py-14">
        <Box className="flex flex-col gap-4 px-8 sm:px-14">
          <Box className="flex flex-col">
            <Box className="mb-14 flex flex-row items-center justify-center gap-2">
              <Logo classNameMobile="hidden" />
              <Chip size="small" variant="outlined" label="Admin" />
            </Box>

            <Box className="flex flex-col gap-10">
              <Box className="flex flex-col">
                <Typography variant="h1" component="h1" className="mb-2">
                  {title}
                </Typography>
                {description && (
                  <Typography variant="body1" className="text-text-primary">
                    {description}
                  </Typography>
                )}
              </Box>

              <Box className="flex flex-col gap-5">{children}</Box>

              {footer && (
                <>
                  <Divider className="text-text-secondary my-0 text-sm"></Divider>
                  <Box className="flex flex-col">{footer}</Box>
                </>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
