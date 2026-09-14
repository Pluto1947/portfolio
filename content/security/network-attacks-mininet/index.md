---
title: "Network Attacks & Mitigations in Mininet"
type: project
domains: [security]
location: louvain-la-neuve
related: []
tags: [networking, mininet, nftables, arptables, scapy, arp-poisoning, mac-flooding, syn-flood, dhcp-spoofing, port-scanning, dos, firewall]
date: 2025-05-14
summary: "Six layer-2/3 network attacks and their nftables/arptables mitigations, built and demonstrated in an isolated Mininet topology."
---

## Context
A hands-on security lab: build a small enterprise network in Mininet, carry out the classic layer-2/3 attacks against it, then defend against each one and prove the defence works.

## Approach
An emulated topology (`topo.py`) split into three zones — Workstations, DMZ servers, and the Internet — with the baseline enterprise policy enforced by nftables rules applied at startup (DMZ servers can answer connections but never initiate them). Six attacks, each paired with a mitigation and a before/after test:

- **ARP cache poisoning** — Scapy MitM poisoning the victim↔gateway mapping; mitigated with arptables rules dropping any IP↔MAC pair that doesn't match the legitimate binding.
- **MAC/CAM table flooding** — flooding the switch with random source MACs to force fail-open (hub) mode; mitigated by pinning the subnet's IP↔MAC mappings and dropping frames from unknown MACs.
- **SYN flood (HTTP)** — Scapy TCP-handshake exhaustion against port 80 with spoofed source IPs from `10.1.0.0/24`; mitigated with an nftables rate-limit + connection cap that still admits legitimate traffic and logs the attack.
- **DHCP starvation + rogue-server spoof** — lease exhaustion followed by a rogue DHCP server issuing attacker-controlled config (a MitM setup); mitigated by restricting DHCP offers to the legitimate server.
- **TCP SYN (half-open) scan** — reconnaissance mapping open ports without completing the handshake; mitigated with nftables SYN rate-limiting so scanned ports report *filtered* instead of *open*.

Attacks scripted in Python/Scapy under `Attacks/`; defences as nftables (`.nft`) and shell scripts under `Protections/` and `Firewalls/`.

## Evidence
Attack and mitigation scripts, the three firewall rule sets, and a slide deck walking through each attack live in the source repo: <https://github.com/Pluto1947/Network-attacks>. Each attack was validated with `ping` loss/latency and Wireshark/tshark packet captures before and after the mitigation — e.g. the SYN-scan target visibly flips from `OPEN` to `FILTERED` once the nftables rules load.

> Asciinema `.cast` recordings of the attack→mitigation runs will replace the static description here in Phase 5 (knowledge-dump presentation).

## Takeaway
The pattern that held across all six: the attacks are cheap and the mitigations are almost entirely about *pinning identity* (IP↔MAC bindings, trusted DHCP server, connection rate limits) rather than deep packet logic. Building the attack first, then defending, made it obvious which single rule actually closed each hole — and how narrow the gap between fail-open and fail-closed really is at layer 2.
