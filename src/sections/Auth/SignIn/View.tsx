import { AuthCard } from "../AuthCard";
import { signInSchema, type SignInValues, totpSchema, type TotpValues } from "../schema";
import { BEGIN_TOTP_SETUP, CONFIRM_TOTP_SETUP, LOGIN, VERIFY_ADMIN_TOTP } from "../useApollo";
import { useSnackbar } from "notistack";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";

import { Box, Button, Typography } from "@mui/material";

import { useAuthContext } from "@/auth";
import { CopyField } from "@/components/CopyButton";
import { Form, FormErrorSummary, RHFOtp, RHFTextField } from "@/components/Form";
import { paths } from "@/routes/paths";
import { applyServerErrors, errorMessage } from "@/utils/graphql";
import { useMutation } from "@apollo/client/react";
import { zodResolver } from "@hookform/resolvers/zod";

type Challenge = { mfaToken: string; setup: boolean };

/** Password, then an authenticator code. First sign-in enrolls the authenticator. */
export default function SignInView() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);

  if (challenge) return <TotpStep challenge={challenge} onRestart={() => setChallenge(null)} />;
  return <PasswordStep onChallenge={setChallenge} />;
}

function PasswordStep({ onChallenge }: { onChallenge: (challenge: Challenge) => void }) {
  const { enqueueSnackbar } = useSnackbar();
  const [login] = useMutation(LOGIN);

  const methods = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (values) => {
    try {
      const { data } = await login({ variables: { data: { ...values, isAdmin: true } } });
      const result = data?.login;
      if (!result?.mfaToken) {
        enqueueSnackbar("Two-factor sign-in is required for staff accounts.", { variant: "error" });
        return;
      }
      onChallenge({ mfaToken: result.mfaToken, setup: result.totpSetupRequired });
    } catch (error) {
      if (!applyServerErrors(error, setError, ["email", "password"])) {
        enqueueSnackbar(errorMessage(error), { variant: "error" });
      }
    }
  });

  return (
    <AuthCard title="Staff sign in" description="NxPay operations console. Customers sign in at the NxPay app.">
      <Form methods={methods} onSubmit={onSubmit}>
        <RHFTextField name="email" label="Email" type="email" autoComplete="username" autoFocus />
        <RHFTextField name="password" label="Password" type="password" autoComplete="current-password" />
        <FormErrorSummary />
        <Box className="flex flex-col gap-2">
          <Link
            to={paths.auth.forgotPassword}
            className="link-text-secondary link-underline-hover text-center text-sm font-semibold"
          >
            Reset Password
          </Link>
          <Button type="submit" variant="contained" loading={isSubmitting}>
            Continue
          </Button>
        </Box>
      </Form>
    </AuthCard>
  );
}

function TotpStep({ challenge, onRestart }: { challenge: Challenge; onRestart: () => void }) {
  const { signIn } = useAuthContext();
  const { enqueueSnackbar } = useSnackbar();
  const [verify] = useMutation(VERIFY_ADMIN_TOTP);
  const [confirm] = useMutation(CONFIRM_TOTP_SETUP);
  const [begin, beginState] = useMutation(BEGIN_TOTP_SETUP);

  const methods = useForm<TotpValues>({ resolver: zodResolver(totpSchema), defaultValues: { code: "" } });
  const {
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = methods;

  const setup = beginState.data?.beginTotpSetup;

  const onSubmit = handleSubmit(async ({ code }) => {
    try {
      const variables = { data: { mfaToken: challenge.mfaToken, code } };
      const token = challenge.setup
        ? (await confirm({ variables })).data?.confirmTotpSetup.accessToken
        : (await verify({ variables })).data?.verifyAdminTotp.accessToken;
      if (token) await signIn(token);
    } catch (error) {
      if (!applyServerErrors(error, setError, ["code"])) {
        enqueueSnackbar(errorMessage(error), { variant: "error" });
      }
    }
  });

  const footer = (
    <Typography variant="body2" className="text-text-secondary">
      The sign-in challenge expires after 5 minutes.{" "}
      <Box component="button" type="button" className="link-primary link-underline-hover" onClick={onRestart}>
        Start over
      </Box>
    </Typography>
  );

  if (challenge.setup && !setup) {
    return (
      <AuthCard
        title="Set up two-factor sign-in"
        description="Staff accounts need an authenticator app such as 1Password, Google Authenticator, or Authy."
        footer={footer}
      >
        <Button
          variant="contained"
          loading={beginState.loading}
          onClick={() =>
            begin({ variables: { mfaToken: challenge.mfaToken } }).catch((e) =>
              enqueueSnackbar(errorMessage(e), { variant: "error" }),
            )
          }
        >
          Show setup code
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={challenge.setup ? "Scan with your authenticator" : "Two-factor sign-in"}
      description={
        challenge.setup
          ? "Scan the QR code, or enter the key by hand, then type the 6-digit code it shows."
          : "Enter the 6-digit code from your authenticator app."
      }
      footer={footer}
    >
      {setup && (
        <Box className="flex flex-col items-center gap-3">
          <Box className="rounded-xl bg-white p-3">
            <QRCodeSVG value={setup.otpauthUrl} size={176} />
          </Box>
          <Box className="w-full">
            <CopyField label="Setup key" value={setup.secret} mono />
          </Box>
        </Box>
      )}
      <Form methods={methods} onSubmit={onSubmit}>
        <RHFOtp name="code" label="Authentication code" autoFocus onComplete={() => void onSubmit()} />
        <FormErrorSummary />
        <Button type="submit" variant="contained" loading={isSubmitting}>
          {challenge.setup ? "Turn on and sign in" : "Sign in"}
        </Button>
      </Form>
    </AuthCard>
  );
}
