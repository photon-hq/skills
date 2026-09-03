# Spectrum Voice over SIP

Voice calls are SIP routes attached to project-owned iMessage lines. They are not Spectrum message Spaces and do not appear on `app.messages`. WhatsApp numbers cannot be used.

## Outbound calls

Configure the SIP application or trunk:

| Setting | Value |
|---|---|
| Server | `sip.spectrum.photon.codes` |
| TLS server port | `5061` |
| TCP server port | `5060` |
| Username | Spectrum project ID |
| Password | Spectrum project secret |
| Registration | Off; Spectrum is not a registrar |
| Caller ID / From | An iMessage line owned by the project |

Prefer TLS with certificate verification. UDP SIP is unsupported. TCP remains supported but does not encrypt signaling. Audio uses RTP and requires the application's UDP RTP range through the firewall.

Use a full international destination such as `+14155550123`. A `403` commonly means the From number is missing or not owned by the authenticated project.

## Inbound calls

Register an inbound route in the dashboard for the exact project and iMessage line. Outbound credentials do not create this route.

Example routes:

```text
sips:agent@voice.example.com:5061
sip:agent@voice.example.com:5060
```

The endpoint must be publicly reachable. Configure its listening transport, port, TLS certificate when using `sips:`, and UDP RTP media range. Optional inbound SIP Digest username/password belong to the receiving application, not the Spectrum project credentials.

## Troubleshooting audio

### Choppy or distorted AI audio

Spectrum uses G.711. Inspect the endpoint's SIP `200 OK`; the negotiated codec should be `PCMU/8000` or `PCMA/8000`. If another codec is selected, correct the endpoint offer/answer configuration. If audio remains choppy on G.711, capture the negotiated codec and call identifiers for support.

### Telephone quality rather than HD

Standard telephone quality is expected. G.711 prioritizes consistent delivery across carrier and mobile networks rather than wideband HD audio.

### One-way or missing audio

Spectrum handles signaling, while RTP media flows directly between the carrier and the SIP endpoint. Check that:

- the endpoint accepts inbound RTP from the carrier's media IPs, not only SIP signaling;
- NATed endpoints advertise a publicly reachable address in SDP;
- the configured UDP media range is open in both directions; and
- endpoint logs show no RTP timeout or packet-receive errors.

For escalation, collect the Photon project ID, SIP Call-ID or call timestamp and numbers, direction, affected side, negotiated codec, and downstream SIP vendor.

## Production checks

- Project ID and secret match the line-owning project.
- SIP registration is disabled.
- Transport is TLS or TCP, never UDP.
- Caller ID is an owned iMessage line.
- Public inbound route matches the receiving listener.
- SIP and RTP firewall/NAT rules permit both signaling and two-way audio.
- Business-profile registration is recommended for outbound reputation but is not required and does not replace inbound route registration.

Official sources: <https://photon.codes/docs/spectrum-ts/providers/voice/outbound-calls>, <https://photon.codes/docs/spectrum-ts/providers/voice/inbound-calls>, and <https://photon.codes/docs/spectrum-ts/providers/voice/troubleshooting>
