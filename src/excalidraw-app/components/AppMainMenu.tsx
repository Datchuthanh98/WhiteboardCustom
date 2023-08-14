import React from "react";
import { PlusPromoIcon } from "../../components/icons";
import { MainMenu } from "../../packages/excalidraw/index";
import { LanguageList } from "./LanguageList";
import permissionEdit from "../../permission/index";

export const AppMainMenu: React.FC<{
  setCollabDialogShown: (toggle: boolean) => any;
  isCollaborating: boolean;
}> = React.memo((props) => {
  return (
    <MainMenu>
      {permissionEdit() && <MainMenu.DefaultItems.LoadScene />}
      {permissionEdit() && <MainMenu.DefaultItems.SaveToActiveFile />}
      {permissionEdit() && <MainMenu.DefaultItems.Export />}
      {permissionEdit() && <MainMenu.DefaultItems.ClearCanvas />}
      <MainMenu.DefaultItems.SaveAsImage />
      {/* <MainMenu.DefaultItems.LiveCollaborationTrigger
        isCollaborating={props.isCollaborating}
        onSelect={() => props.setCollabDialogShown(true)}
      /> */}
      <MainMenu.DefaultItems.Help />

      <MainMenu.Separator />

      {/* <MainMenu.ItemLink
        icon={PlusPromoIcon}
        href="https://plus.excalidraw.com/plus?utm_source=excalidraw&utm_medium=app&utm_content=hamburger"
        className="ExcalidrawPlus"
      >
        Excalidraw+
      </MainMenu.ItemLink>
      <MainMenu.DefaultItems.Socials />
      <MainMenu.Separator /> */}
      <MainMenu.DefaultItems.ToggleTheme />
      {/* <MainMenu.ItemCustom>
        <LanguageList style={{ width: "100%" }} />
      </MainMenu.ItemCustom> */}
      <MainMenu.DefaultItems.ChangeCanvasBackground />
    </MainMenu>
  );
});
