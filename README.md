# JKO HW
### Requirements:
敘述：

設想一情境，有個服務它裡面的流通貨幣皆為 token A，因此要使用該服務的用戶，都得用他手上的 token B 以同一比例 (N) 去換成 token A。
此外，當用戶不再想使用這服務時，都可以再把 token A 以另一比例 (K) 換回 token B。
所以我們決定實作一個 Stable Swap 的智能合約，來讓用戶有個管道去自由交換手上的 token！


問題：
1. 請實作一個智能合約完成題幹所敘述的功能，須包含以下功能：
  - a. 服務商可以自訂兩個 ERC20 幣種 A, B，並且可以設定 A → B 之匯率 N 以及 B→ A 之匯率 K
  - b. 只有創建交易對的服務商可從合約隨時 放入 / 提出 A, B 兩個幣種
  - c. 用戶隨時可以丟入 A 或 B 依服務商設定之比例去換出 B 或 A，若餘額不足便 revert
  - d. 其他您認為該情境下會需要的 function
  - e. (Optional) 合約中可以存在著不止一個服務商及交易配對，比如： A ↔ B、C ↔ D、B ↔ D ...
2. 請寫下該智能合約的 test case
3. 請 deploy 該合約至任一以太測試鏈上並完成 Etherscan 上的合約認證
4. 可加上 Readme 介紹您的程式碼


### Concerns
1. Not sure about the 1-b rule, because in my understanding that a contract can not reject to receive a Token. So I guess maybe you want me to provide a function that only the owner can deposit Tokens to the StableSwap Contract

### Outline
1. Avaliable to provide swappble token pairs. (if only if set by the owner)
2. Provide swappablePairs function for getting all swappble token pairs infos (1st output is inToken, 2nd output is outToken, 3rd output is swap rate)


```
   Deploying 'StableSwap'
   ----------------------
   > transaction hash:    0xe28ad4b1b61204d0551bb63edd91f668749660899cc4f675e80db3d18bb00fb9
   > Blocks: 1            Seconds: 29
   > contract address:    0x03526B4dE9144B1Bf88BAF1C224F9662ABD20e6a
   > block number:        10451747
   > block timestamp:     1649167148
   > account:             0x100fb179b6bfE40B0Ea46821e1C1714978Fd0987
   > balance:             0.617246531859908963
   > gas used:            2341304 (0x23b9b8)
   > gas price:           2.500000051 gwei
   > value sent:          0 ETH
   > total cost:          0.005853260119406504 ETH

   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:     0.005853260119406504 ETH
```
