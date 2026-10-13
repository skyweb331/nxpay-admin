import Helmet from "@/components/Helmet";
import ContentWrapper from "@/components/layout/containers/content-wrapper";
import PageHeader from "@/components/PageHeader";
import View from "@/sections/WebhookEvent/List/View";

export default function Page() {
  return (
    <>
      <Helmet title="Webhook events" />
      <PageHeader title="Webhook events" crumbs={[{ label: "Logs" }, { label: "Webhook events" }]} />
      <ContentWrapper>
        <View />
      </ContentWrapper>
    </>
  );
}
