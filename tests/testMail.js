const { OAuth2Client } = require('google-auth-library');

const CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com'; // Google Cloud에서 제공받은 OAuth 2.0 클라이언트 ID
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET'; // 클라이언트 시크릿
const REDIRECT_URI = 'YOUR_REDIRECT_URI'; // 인증 후 리디렉션 될 URI

const oauth2Client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

// 사용자 인증 URL 생성
function getAuthUrl() {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // 오프라인 액세스 허용
    scope: scopes, // 필요한 스코프 지정
  });

  console.log('인증 URL:', url);
}

// 인증 코드를 사용하여 토큰 받기
async function getTokens(code) {
  const { tokens } = await oauth2Client.getToken(code);
  console.log('토큰:', tokens);
}

// 예시 실행
getAuthUrl();
// 사용자가 인증 후 리디렉션 URI에 포함된 인증 코드를 사용하여 토큰을 받아올 수 있습니다.
// getTokens('인증 코드');