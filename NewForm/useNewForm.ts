import {
  Resource,
  useString,
  properties,
  useStore,
  useResource,
  useArray,
  Core,
  core,
} from '@tomic/react';
import { useState, useEffect } from 'react';

const resourseOpts = { newResource: true };

type UseNewForm = {
  klass: Resource<Core.Class>;
  setSubject: (v: string) => void;
  initialSubject?: string;
  parent?: string;
};

/** Shared logic for NewForm components. */
export const useNewForm = (args: UseNewForm) => {
  const { klass, setSubject, initialSubject, parent } = args;

  const store = useStore();
  const [initialized, setInitialized] = useState(false);

  const [subjectValue, setSubjectValueInternal] = useState<string>(() => {
    if (initialSubject === undefined) {
      return store.createSubject(klass.props.shortname);
    }

    return initialSubject;
  });

  const [subjectErr, setSubjectErr] = useState<Error | undefined>(undefined);
  const resource = useResource(subjectValue, resourseOpts);
  const [parentVal] = useString(resource, properties.parent);
  const [isAVal] = useArray(resource, properties.isA);

  // When the resource is created or updated, make sure that the parent and class are present
  useEffect(() => {
    (async () => {
      if (parentVal !== parent) {
        await resource.set(core.properties.parent, parent, store);
      }

      if (isAVal.length === 0) {
        await resource.addClasses(store, klass.getSubject());
      }

      setInitialized(true);
    })();
  }, [resource]);

  async function setSubjectValue(newSubject: string) {
    setSubjectValueInternal(newSubject);
    setSubjectErr(undefined);
    setSubject(newSubject);

    if (resource.get(properties.parent) !== parent) {
      // This prevents that we move an empty temporary resource
      return;
    }

    try {
      await store.renameSubject(resource, newSubject);
    } catch (e) {
      setSubjectErr(e);
    }
  }

  return {
    subjectErr,
    subjectValue,
    setSubjectValue,
    resource,
    initialized,
  };
};
