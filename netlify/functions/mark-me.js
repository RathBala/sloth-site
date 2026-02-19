exports.handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Set-Cookie': 'rath_visitor=true; Max-Age=31536000; Path=/; SameSite=Lax',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ marked: true }),
  }
}
