import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // 管理者ユーザーを作成
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.systemUser.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        email: 'admin@example.com',
      },
    });

    // テストユーザーを作成
    const user = await prisma.user.create({
      data: {
        username: 'test',
        password: await bcrypt.hash('test123', 10),
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        chatworkId: 'test123',
      },
    });

    // テスト端末を作成
    const terminal = await prisma.terminal.create({
      data: {
        aicoId: 'aico001',
        name: 'テスト端末1',
        status: 'OFFLINE',
        greeting: 'こんにちは！',
        offlineCount: 0,
        downtimeMinutes: 0,
        lastPolling: new Date(),
      },
    });

    // テストテンプレートを作成
    const template = await prisma.template.create({
      data: {
        name: '問い合わせ通知',
        content: '[info][title]新規問い合わせ[/title]端末「{terminal}」で以下の問い合わせがありました。\n\n＜前回の会話＞\n{prevmessage}\n\n＜今回の会話＞\n{message}\n\n日時：{datetime}[/info]',
      },
    });

    // テストアクションを作成
    const action = await prisma.action.create({
      data: {
        name: '問い合わせ対応',
        terminalId: terminal.id,
        description: '問い合わせキーワードを検知してChatworkに通知',
        keywords: '問い合わせ,相談,連絡',
        condition: 'OR',
        type: 'CHATWORK',
        templateId: template.id,
        userId: user.id,
      },
    });

    console.log('データベースの初期化が完了しました');
    console.log('作成されたデータ:', {
      admin: { id: admin.id, username: admin.username },
      user: { id: user.id, username: user.username },
      terminal: { id: terminal.id, aicoId: terminal.aicoId },
      template: { id: template.id, name: template.name },
      action: { id: action.id, name: action.name },
    });
  } catch (error) {
    console.error('データベースの初期化中にエラーが発生しました:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });