import { PageLayout } from "@/components/layout/PageLayout";

const AboutPage = () => {
  return (
    <PageLayout
      title="このサイトについて"
      description="CSVファイルをアップロードしてデータを管理・可視化できるアプリです。"
    >
      <section className="mb-6">
        <p className="text-gray-800 leading-relaxed">
          このアプリは、CSVファイルをアップロードしてデータを管理したり、
          時系列グラフとして可視化することができます。
          データの整理や分析、簡易的な可視化に役立つツールです。
        </p>
      </section>
    </PageLayout>
  );
};

export default AboutPage;
