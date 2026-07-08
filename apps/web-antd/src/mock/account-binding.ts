/**
 * Mock API Plugin for account-binding endpoints
 * 拦截 /v1/account-binding/* 和 /v1/auth/wechat/* 路由，返回模拟数据
 */
import type { Plugin } from 'vite';

// 模拟用户数据存储
const mockUsers = new Map<
  string,
  {
    email: string;
    id: string;
    password: string;
    phone: string;
    username: string;
    wechatNickname: string;
  }
>();

// 初始化一个测试用户
mockUsers.set('289', {
  id: '289',
  username: 'ggh',
  password: '123456',
  phone: '',
  email: '2517563877@qq.com',
  wechatNickname: '',
});

// 验证码存储
const verificationCodes = new Map<string, string>();

// 一次性 Token 存储
const oneTimeTokens = new Map<string, { expiresAt: number; userId: string }>();

function generateToken(): string {
  return `ot_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function generateCode(): string {
  // Mock 环境使用固定验证码方便测试
  return '123456';
}

function jsonResponse(res: any, data: any, status = 200) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

function parseBody(req: any): Promise<any> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk: string) => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

function getUserIdFromToken(req: any): null | string {
  const auth = req.headers.authorization || '';
  const match = auth.match(/Bearer\s+(.+)/);
  if (!match) return null;

  // 从 JWT 中解析 userId（简化处理，取 payload 部分）
  try {
    const payload = match[1].split('.')[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/')),
    );
    // 支持多种 claim 名称
    return (
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] ||
      decoded.nameid ||
      decoded.sub ||
      null
    );
  } catch {
    return null;
  }
}

export function accountBindingMockPlugin(): Plugin {
  return {
    name: 'account-binding-mock',
    configureServer(server) {
      // Mock 微信相关接口
      server.middlewares.use('/v1/auth/wechat', async (req, res, next) => {
        if (req.method !== 'GET') {
          return next();
        }

        const url = req.url || '';
        const userId = getUserIdFromToken(req);

        console.log(`[Mock] WeChat ${url}`, { userId });

        // ========== 获取微信二维码 ==========
        if (url === '/qrcode') {
          if (!userId) {
            return jsonResponse(
              res,
              { code: 401, message: '未登录', data: null },
              401,
            );
          }

          // 生成一个模拟的二维码 URL（使用 QR 服务生成真实可扫描的二维码）
          const qrData = `wechat://bind?user=${userId}&time=${Date.now()}`;
          const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;

          return jsonResponse(res, {
            code: 0,
            message: '获取成功',
            data: qrCodeUrl,
          });
        }

        // ========== 微信扫码回调 ==========
        if (url === '/callback') {
          if (!userId) {
            return jsonResponse(
              res,
              { code: 401, message: '未登录', data: null },
              401,
            );
          }

          // 模拟扫码状态：返回未扫码状态
          // 在实际场景中，这里会检查用户是否已扫码
          return jsonResponse(res, {
            code: 0,
            message: '查询成功',
            data: { success: false, scanned: false },
          });
        }

        next();
      });

      // Mock 账号绑定接口
      server.middlewares.use('/v1/account-binding', async (req, res, next) => {
        // 只处理 POST 请求
        if (req.method !== 'POST') {
          return next();
        }

        const url = req.url || '';
        const body = await parseBody(req);
        const userId = getUserIdFromToken(req);

        console.log(`[Mock] ${url}`, { userId, body });

        // ========== verify-password ==========
        if (url === '/verify-password') {
          if (!userId) {
            return jsonResponse(
              res,
              { code: 401, message: '未登录', data: null },
              401,
            );
          }

          const user = mockUsers.get(userId);
          if (!user) {
            return jsonResponse(res, {
              code: 404,
              message: '用户不存在',
              data: null,
            });
          }

          if (body.password !== user.password) {
            return jsonResponse(res, {
              code: 400,
              message: '密码错误',
              data: null,
            });
          }

          // 生成一次性 token，5 分钟有效
          const token = generateToken();
          oneTimeTokens.set(token, {
            userId,
            expiresAt: Date.now() + 5 * 60 * 1000,
          });

          return jsonResponse(res, {
            code: 0,
            message: '验证成功',
            data: { token },
          });
        }

        // ========== send-code ==========
        if (url === '/send-code') {
          const { type, account } = body;
          if (!type || !account) {
            return jsonResponse(res, {
              code: 400,
              message: '参数不完整',
              data: null,
            });
          }

          const code = generateCode();
          const key = `${type}:${account}`;
          verificationCodes.set(key, code);

          console.log(`[Mock] 验证码已发送: ${key} -> ${code}`);

          return jsonResponse(res, {
            code: 0,
            message: '验证码已发送',
            data: null,
          });
        }

        // ========== bind ==========
        if (url === '/bind') {
          if (!userId) {
            return jsonResponse(
              res,
              { code: 401, message: '未登录', data: null },
              401,
            );
          }

          const { type, account, code, token } = body;
          if (!type || !account) {
            return jsonResponse(res, {
              code: 400,
              message: '参数不完整',
              data: null,
            });
          }

          // 验证一次性 token
          if (!token || !oneTimeTokens.has(token)) {
            return jsonResponse(res, {
              code: 400,
              message: '请先验证密码',
              data: null,
            });
          }

          const tokenData = oneTimeTokens.get(token)!;
          if (tokenData.userId !== userId || tokenData.expiresAt < Date.now()) {
            oneTimeTokens.delete(token);
            return jsonResponse(res, {
              code: 400,
              message: 'Token 无效或已过期',
              data: null,
            });
          }

          // 验证验证码（微信绑定不需要验证码）
          if (type !== 'wechat' && code) {
            const codeKey = `${type}:${account}`;
            const storedCode = verificationCodes.get(codeKey);
            if (storedCode !== code) {
              return jsonResponse(res, {
                code: 400,
                message: '验证码错误',
                data: null,
              });
            }
            verificationCodes.delete(codeKey);
          }

          // 检查是否已被其他用户绑定
          for (const [uid, u] of mockUsers) {
            if (uid !== userId) {
              if (type === 'phone' && u.phone === account) {
                return jsonResponse(res, {
                  code: 400,
                  message: '该手机号已被其他账号绑定',
                  data: null,
                });
              }
              if (type === 'email' && u.email === account) {
                return jsonResponse(res, {
                  code: 400,
                  message: '该邮箱已被其他账号绑定',
                  data: null,
                });
              }
            }
          }

          // 执行绑定
          const user = mockUsers.get(userId)!;
          if (type === 'phone') user.phone = account;
          if (type === 'email') user.email = account;
          if (type === 'wechat') user.wechatNickname = account;
          oneTimeTokens.delete(token);

          console.log(`[Mock] 绑定成功: ${type} -> ${account}`, user);

          return jsonResponse(res, {
            code: 0,
            message: '绑定成功',
            data: null,
          });
        }

        // ========== rebind ==========
        if (url === '/rebind') {
          if (!userId) {
            return jsonResponse(
              res,
              { code: 401, message: '未登录', data: null },
              401,
            );
          }

          const { type, account, code, token } = body;
          if (!type || !account) {
            return jsonResponse(res, {
              code: 400,
              message: '参数不完整',
              data: null,
            });
          }

          // 验证一次性 token
          if (!token || !oneTimeTokens.has(token)) {
            return jsonResponse(res, {
              code: 400,
              message: '请先验证密码',
              data: null,
            });
          }

          const tokenData = oneTimeTokens.get(token)!;
          if (tokenData.userId !== userId || tokenData.expiresAt < Date.now()) {
            oneTimeTokens.delete(token);
            return jsonResponse(res, {
              code: 400,
              message: 'Token 无效或已过期',
              data: null,
            });
          }

          // 验证验证码
          if (code) {
            const codeKey = `${type}:${account}`;
            const storedCode = verificationCodes.get(codeKey);
            if (storedCode !== code) {
              return jsonResponse(res, {
                code: 400,
                message: '验证码错误',
                data: null,
              });
            }
            verificationCodes.delete(codeKey);
          }

          // 执行换绑
          const user = mockUsers.get(userId)!;
          if (type === 'phone') user.phone = account;
          if (type === 'email') user.email = account;
          if (type === 'wechat') user.wechatNickname = account;
          oneTimeTokens.delete(token);

          console.log(`[Mock] 换绑成功: ${type} -> ${account}`, user);

          return jsonResponse(res, {
            code: 0,
            message: '换绑成功',
            data: null,
          });
        }

        // ========== unbind ==========
        if (url === '/unbind') {
          if (!userId) {
            return jsonResponse(
              res,
              { code: 401, message: '未登录', data: null },
              401,
            );
          }

          const { type } = body;
          if (!type) {
            return jsonResponse(res, {
              code: 400,
              message: '参数不完整',
              data: null,
            });
          }

          const user = mockUsers.get(userId)!;
          if (type === 'phone') user.phone = '';
          if (type === 'email') user.email = '';
          if (type === 'wechat') user.wechatNickname = '';

          console.log(`[Mock] 解绑成功: ${type}`, user);

          return jsonResponse(res, {
            code: 0,
            message: '解绑成功',
            data: null,
          });
        }

        // 未匹配的路由
        next();
      });
    },
  };
}
