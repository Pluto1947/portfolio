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
A practical security lab. The goal is to build a small enterprise network in Mininet, run the classic layer 2 and layer 3 attacks against it, then defend against each one and prove the defence works.

## Approach
An emulated topology (`topo.py`) splits into three zones: Workstations, DMZ servers, and the Internet. The baseline enterprise policy is enforced by nftables rules applied at startup, so the DMZ servers can answer connections but never open them. Six attacks follow, each paired with a mitigation and a before and after test.

- **ARP cache poisoning:** a Scapy man in the middle that poisons the victim and gateway mappings, stopped by arptables rules that drop any packet whose IP and MAC do not match the legitimate binding.
- **MAC and CAM table flooding:** the switch is flooded with random source MACs until it fails open into hub mode, stopped by pinning the subnet's IP and MAC mappings and dropping frames from unknown MACs.
- **SYN flood over HTTP:** a Scapy TCP handshake exhaustion against port 80 with spoofed source IPs from `10.1.0.0/24`, stopped by an nftables rate limit and connection cap that still admits legitimate traffic and logs the attack.
- **DHCP starvation and rogue server:** lease exhaustion followed by a rogue DHCP server handing out attacker controlled config, stopped by allowing DHCP offers only from the legitimate server.
- **TCP SYN half open scan:** reconnaissance that maps open ports without completing the handshake, stopped by nftables SYN rate limiting so scanned ports report `filtered` instead of `open`.

Attacks are scripted in Python and Scapy under `Attacks/`. Defences are nftables (`.nft`) and shell scripts under `Protections/` and `Firewalls/`.

## Evidence
The attack and mitigation scripts, the three firewall rule sets, and a slide deck walking through each attack live in the source repo: <https://github.com/Pluto1947/Network-attacks>. Each attack was validated with `ping` loss and latency, plus Wireshark and tshark packet captures taken before and after the mitigation. The SYN scan target visibly flips from `OPEN` to `FILTERED` once the nftables rules load.

> Asciinema `.cast` recordings of the attack and mitigation runs will replace this static description in Phase 5, the knowledge dump presentation.

## Takeaway
One pattern held across all six. The attacks are cheap, and the mitigations are almost entirely about pinning identity, meaning IP and MAC bindings, a trusted DHCP server, and connection rate limits, rather than deep packet logic. Building the attack first, then defending, made it obvious which single rule actually closed each hole, and how narrow the gap between fail open and fail closed really is at layer 2.
