// src/components/TaeTeDaMas/PerksSection.tsx
import { Card, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { ReactNode } from "react";

export type Perk = {
  icon: ReactNode;
  titulo: string;
  desc: string;
  tag: string;
};

type Props = {
  perks: Perk[];
};

export function PerksSection({ perks }: Props) {
  return (
    <Grid container spacing={1.5} sx={{ mb: 1 }}>
      {perks.map((p, idx) => (
        <Grid key={idx} item xs={12} md={4}>
          <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ p: { xs: 1.25, md: 2 } }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.75 }}
              >
                {p.icon}
                <Typography
                  fontWeight={800}
                  sx={{ fontSize: { xs: 13, md: 16 } }}
                >
                  {p.titulo}
                </Typography>
                <Chip size="small" label={p.tag} color="primary" />
              </Stack>
              <Typography
                color="text.secondary"
                sx={{ fontSize: { xs: 11, md: 13 } }}
              >
                {p.desc}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
