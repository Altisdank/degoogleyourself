export function configureGooglePrefill(button, email, status) {
  const id = document.querySelector('meta[name="google-oauth-client-id"]')?.content.trim();
  if (!id) return;
  button.hidden = false;
  button.disabled = true;

  function initialize() {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: id,
      scope: 'openid email',
      include_granted_scopes: false,
      callback: async response => {
        if (response.error || !response.access_token) {
          status.textContent = 'Google kunde inte dela din e-post. Du kan skriva in den själv.';
          return;
        }
        try {
          const result = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: {Authorization: 'Bearer ' + response.access_token},
            cache: 'no-store'
          });
          if (!result.ok) throw new Error('Google userinfo');
          const data = await result.json();
          if (data.email_verified !== true || typeof data.email !== 'string') throw new Error('Unverified email');
          email.value = data.email;
          email.dispatchEvent(new Event('input', {bubbles:true}));
          status.textContent = 'E-postadressen är ifylld.';
        } catch {
          status.textContent = 'E-postadressen kunde inte hämtas. Skriv in den själv.';
        }
      },
      error_callback: () => {
        status.textContent = 'Google-fönstret kunde inte slutföras. Skriv in e-postadressen själv.';
      }
    });
    button.disabled = false;
    button.addEventListener('click', () => client.requestAccessToken({prompt:'select_account'}));
  }
  if (window.google?.accounts?.oauth2) {
    initialize();
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.onload = initialize;
  script.onerror = () => {
    button.hidden = true;
    status.textContent = 'Google-inloggningen är otillgänglig. Skriv in e-postadressen själv.';
  };
  document.head.append(script);
}
