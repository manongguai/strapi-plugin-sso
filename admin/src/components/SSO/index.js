import React, { useEffect, useState, useMemo } from "react";
import { Box, Divider, Flex, Typography, Tooltip } from "@strapi/design-system";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useIntl } from "react-intl";
import { SSOProviders } from "./SSOProviders";
import { useFetchClient } from "@strapi/helper-plugin";
import { filterProviders } from "../../utils/filterProviders";

const DividerFull = styled(Divider)`
  flex: 1;
`;

const SSO = () => {
  const { formatMessage } = useIntl();
  const { get } = useFetchClient();
  const [allowProviders, setAllowProviders] = useState([]);
  async function getAllowProviders() {
    const { data } = await get("/sso/providers");
    setAllowProviders(data);
  }
  useEffect(() => {
    getAllowProviders();
  }, []);

  const providers = useMemo(() => {
    return filterProviders(allowProviders);
  }, [allowProviders]);
  return (
    <>
      {providers.length>0 && (
        <Box paddingTop={7}>
          <Flex direction="column" alignItems="stretch" gap={7}>
            <Flex>
              <DividerFull />
              <Box paddingLeft={3} paddingRight={3}>
                <Typography variant="sigma" textColor="neutral600">
                  {formatMessage({ id: "Auth.login.sso.divider" })}
                </Typography>
              </Box>
              <DividerFull />
            </Flex>
            <SSOProviders providers={providers} displayAllProviders={false} />
          </Flex>
        </Box>
      )}
    </>
  );
};

export default SSO;
