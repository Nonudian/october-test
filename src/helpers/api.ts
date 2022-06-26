import axios from 'axios'

interface ExternalAPIConfig {
  baseUrl: string
  params?: Record<string, string>
  authorizationToken: string
}

/**
 * Execute axios request from a given API and request configuration.
 * @returns The JSON response expected.
 */
export const retrieveFromExternalAPI = async <T>({
  baseUrl,
  params,
  authorizationToken,
}: ExternalAPIConfig) => {
  const { data } = await axios.get<T>(
    `${baseUrl}${!params ? '' : `?${new URLSearchParams(params).toString()}`}`,
    {
      headers: {
        Authorization: `Bearer ${authorizationToken}`,
        Accept: 'application/json',
      },
    }
  )

  return data
}
