import { ReactNode } from "react";
import { Link } from "react-router";

import { Breadcrumbs, Grid, Typography } from "@mui/material";

import TitleWrapper from "@/components/layout/containers/title-wrapper";
import { paths } from "@/routes/paths";

export type Crumb = { label: string; href?: string };

/** Starter title block: h1, breadcrumbs (Home first), optional right-aligned actions. */
export function PageHeader({
  title,
  crumbs = [],
  actions,
}: {
  title: ReactNode;
  crumbs?: Crumb[];
  actions?: ReactNode;
}) {
  return (
    <TitleWrapper>
      <Grid container spacing={2.5} className="w-full" size={12}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            {title}
          </Typography>
          <Breadcrumbs>
            <Link color="inherit" to={paths.dashboard}>
              Home
            </Link>
            {crumbs.map((crumb) =>
              crumb.href ? (
                <Link key={crumb.label} color="inherit" to={crumb.href}>
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} variant="body2">
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        </Grid>
        {actions && (
          <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row flex-wrap items-start gap-1">
            {actions}
          </Grid>
        )}
      </Grid>
    </TitleWrapper>
  );
}

export default PageHeader;
