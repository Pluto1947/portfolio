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

## 🧭 Context

A practical security lab. Build a small enterprise network in Mininet, run the classic layer 2 and layer 3 attacks against it, then defend against each one and prove the defence works.

## 🛠️ Approach

- **Topology:** three zones, Workstations, DMZ servers, and the Internet. The baseline policy is enforced by `nftables` at startup, so DMZ servers answer connections but never open them.
- **🕵️ ARP cache poisoning**
  - **Attack:** a Scapy man in the middle that poisons the victim and gateway mappings.
  - **Mitigation:** arptables rules drop any packet whose IP and MAC do not match the legitimate pair.
- **🌊 MAC and CAM flooding**
  - **Attack:** the switch is flooded with random source MACs until it fails open into hub mode.
  - **Mitigation:** pin the subnet's IP and MAC mappings and drop frames from unknown MACs.
- **🌩️ SYN flood over HTTP**
  - **Attack:** a Scapy TCP handshake exhaustion on port 80 with spoofed source IPs from `10.1.0.0/24`.
  - **Mitigation:** an nftables rate limit and connection cap that still admits legitimate traffic and logs the attack.
- **📮 DHCP starvation and rogue server**
  - **Attack:** lease exhaustion, then a rogue DHCP server handing out attacker controlled config.
  - **Mitigation:** allow DHCP offers only from the legitimate server.
- **🔎 TCP SYN half open scan**
  - **Attack:** reconnaissance that maps open ports without completing the handshake.
  - **Mitigation:** nftables SYN rate limiting, so scanned ports report `filtered` instead of `open`.

## 🧪 Evidence

- Scripts, firewall rule sets, and a slide deck live in the source repo: <https://github.com/Pluto1947/Network-attacks>.
- Validated with `ping` loss and latency, plus Wireshark and tshark captures before and after. The SYN scan target flips from `OPEN` to `FILTERED` once the rules load.
- 📼 Asciinema recordings of each run land in Phase 5.

## 💡 Takeaway

- The mitigations are almost entirely about pinning identity, meaning IP and MAC bindings, a trusted DHCP server, and connection rate limits, rather than deep packet logic.
- Building the attack first, then defending, made it obvious which single rule closed each hole.
