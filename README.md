## Purse Token Interface
这个项目多数的组件都是直接在页面文件 (page) 里实现，只有在 `/lpfarm/menu` 里有拆分了一些组件。另外，在 `/lpfarm/menu` 和 `/stake` 和 `/rewards` 里有连接钱包的组件。

----
### /
page: `components/Landing/index.tsx`

### /home
page: `components/Main/index.tsx`

### /lpfarm/farmInfo
page: `components/FarmInfo/index.tsx`

### /lpfarm/menu
page: `components/FarmMenu/index.tsx`  
component: `components/PoolCard/index.tsx`  
component: `components/Deposit/index.tsx`  
component: `components/ConnectWallet.tsx`

### /lpfarm/fxswap
page: `components/FXSwap/index.tsx`

### /stake
page: `components/Stake/index.tsx`  
component: `components/ConnectWallet.tsx`

### /rewards
page: `components/Reward/index.tsx`  
component: `components/ConnectWallet.tsx`

### Navbar
page: `components/Navbar/index.tsx`
